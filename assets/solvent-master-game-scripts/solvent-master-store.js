globalThis.SolventStore = {
  async load(){const raw=localStorage.getItem(SolventMasterConfig.gameplay.storageKey);if(!raw)return {};try{return JSON.parse(raw);}catch{throw new Error('Saved progress could not be read. Existing data has been retained.');}},
  async save(profile){localStorage.setItem(SolventMasterConfig.gameplay.storageKey,JSON.stringify(profile));}
};
