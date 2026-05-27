const Storage = {
  // Referências escopadas à planilha ativa
  _txRef()  { return db.collection('planilhas').doc(App.currentPlanilhaId).collection('transactions'); },
  _plRef()  { return db.collection('planilhas').doc(App.currentPlanilhaId).collection('planned'); },

  // Leitura — retorna cache em memória
  getTransactions() { return (typeof App !== 'undefined' && App.transactions) || []; },
  getPlanned()      { return (typeof App !== 'undefined' && App.planned)      || []; },

  // ── Transações ────────────────────────────────────────────────────────────
  async addTransaction(data) {
    return this._txRef().add({ ...data, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
  },

  async addTransactionBatch(dataArray) {
    const batch = db.batch();
    dataArray.forEach(data => {
      batch.set(this._txRef().doc(), {
        ...data,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    });
    return batch.commit();
  },

  async updateTransaction(id, data) {
    return this._txRef().doc(id).update(data);
  },

  async deleteTransaction(id) {
    return this._txRef().doc(id).delete();
  },

  async deleteTransactionGroup(groupId) {
    const snap = await this._txRef().where('groupId', '==', groupId).get();
    const batch = db.batch();
    snap.docs.forEach(doc => batch.delete(doc.ref));
    return batch.commit();
  },

  // ── Planejados ────────────────────────────────────────────────────────────
  async addPlanned(data) {
    return this._plRef().add({ ...data, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
  },

  async deletePlanned(id) {
    return this._plRef().doc(id).delete();
  },

  // ── Planilhas ─────────────────────────────────────────────────────────────
  async getUserPlanilhas() {
    const snap = await db.collection('planilhas')
      .where('memberIds', 'array-contains', auth.currentUser.uid)
      .get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async createPlanilha(name) {
    const user  = auth.currentUser;
    const code  = _genShareCode();
    return db.collection('planilhas').add({
      name,
      ownerId:   user.uid,
      shareCode: code,
      memberIds: [user.uid],
      members: {
        [user.uid]: { displayName: user.displayName || '', email: user.email, role: 'owner' },
      },
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  },

  async renamePlanilha(id, name) {
    return db.collection('planilhas').doc(id).update({ name });
  },

  async joinPlanilha(code) {
    const user = auth.currentUser;
    const snap = await db.collection('planilhas')
      .where('shareCode', '==', code.toUpperCase().trim())
      .get();
    if (snap.empty) throw new Error('Código inválido. Verifique e tente novamente.');
    const doc  = snap.docs[0];
    const data = doc.data();
    if (data.memberIds.includes(user.uid)) throw new Error('Você já faz parte desta planilha.');
    return doc.ref.update({
      memberIds: firebase.firestore.FieldValue.arrayUnion(user.uid),
      [`members.${user.uid}`]: {
        displayName: user.displayName || '',
        email: user.email,
        role: 'editor',
      },
    });
  },

  async leavePlanilha(id) {
    const uid = auth.currentUser.uid;
    return db.collection('planilhas').doc(id).update({
      memberIds: firebase.firestore.FieldValue.arrayRemove(uid),
      [`members.${uid}`]: firebase.firestore.FieldValue.delete(),
    });
  },

  async deletePlanilha(id) {
    return db.collection('planilhas').doc(id).delete();
  },

  async removeMember(planilhaId, uid) {
    return db.collection('planilhas').doc(planilhaId).update({
      memberIds: firebase.firestore.FieldValue.arrayRemove(uid),
      [`members.${uid}`]: firebase.firestore.FieldValue.delete(),
    });
  },
};

function _genShareCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
