// Storage: leituras vêm do cache em memória (App.*), escritas vão direto ao Firestore
const Storage = {
  // Leitura — retorna o array em memória mantido pelo onSnapshot
  getTransactions() { return (typeof App !== 'undefined' && App.transactions) || []; },
  getPlanned()      { return (typeof App !== 'undefined' && App.planned)      || []; },

  // Escrita assíncrona no Firestore
  async addTransaction(data) {
    return db.collection('transactions').add({
      ...data,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  },

  async updateTransaction(id, data) {
    return db.collection('transactions').doc(id).update(data);
  },

  async deleteTransaction(id) {
    return db.collection('transactions').doc(id).delete();
  },

  async addPlanned(data) {
    return db.collection('planned').add({
      ...data,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  },

  async deletePlanned(id) {
    return db.collection('planned').doc(id).delete();
  },
};
