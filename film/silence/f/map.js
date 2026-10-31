/* The ancient Mediterranean world, hand-traced and simplified (lon, lat). Not a survey map — a stage for light.
   Seas are drawn over land; islands are drawn back over the seas. */
window.MAP = {
  seas: [
    // the Mediterranean, clockwise from Gibraltar
    [[-5.6, 36.0], [-4.4, 36.7], [-2.0, 36.7], [-0.5, 38.3], [0.2, 38.8], [-0.3, 39.5], [0.9, 41.0], [3.2, 41.9], [3.1, 43.0], [4.8, 43.4], [6.0, 43.1],
     [7.5, 43.8], [8.8, 44.4], [10.2, 43.9], [10.5, 42.9], [12.2, 41.7], [14.0, 40.8], [15.6, 40.1], [15.7, 38.2], [16.6, 38.4], [17.1, 39.0], [16.5, 39.7],
     [17.2, 40.5], [18.5, 40.1], [18.0, 40.6], [16.0, 41.4], [14.0, 42.6], [13.6, 43.5], [12.4, 44.2], [12.3, 45.3], [13.7, 45.7], [14.5, 45.2], [15.9, 43.6],
     [18.5, 42.4], [19.4, 41.8], [19.4, 40.3], [20.2, 39.5], [21.1, 38.3], [21.7, 36.8], [22.5, 36.4], [23.2, 36.4], [22.9, 37.5], [23.5, 38.0], [24.0, 38.2],
     [22.9, 39.4], [22.9, 40.5], [23.9, 40.6], [24.4, 40.9], [26.0, 40.8], [26.2, 40.3], [26.2, 39.5], [26.8, 38.8], [26.3, 38.3], [27.2, 37.9], [27.4, 37.0],
     [28.2, 36.7], [29.6, 36.2], [30.6, 36.8], [32.0, 36.5], [33.5, 36.2], [34.6, 36.8], [35.9, 36.8], [35.8, 35.8], [35.9, 34.6], [35.5, 33.9], [35.1, 33.0],
     [34.8, 32.1], [34.3, 31.3], [32.3, 31.3], [31.0, 31.6], [29.9, 31.2], [28.0, 31.1], [25.2, 31.6], [23.2, 32.2], [21.0, 32.8], [20.0, 32.0], [20.0, 31.0],
     [19.0, 30.3], [17.0, 31.0], [15.4, 32.3], [13.0, 32.9], [11.1, 33.2], [10.2, 34.3], [11.1, 35.2], [10.6, 36.4], [11.1, 37.0], [10.2, 37.2], [9.8, 37.3],
     [8.6, 36.9], [6.4, 37.1], [5.0, 36.8], [3.0, 36.8], [1.0, 36.5], [-1.0, 35.7], [-2.2, 35.2], [-3.9, 35.2], [-5.3, 35.9]],
    // the Black Sea (with the Bosporus and the Sea of Marmara folded in)
    [[28.0, 41.2], [29.1, 41.2], [31.4, 41.2], [33.5, 42.0], [35.2, 42.0], [37.0, 41.1], [39.7, 41.0], [41.5, 41.5], [41.6, 42.6], [40.0, 43.4], [38.0, 44.4],
     [36.6, 45.2], [35.0, 45.0], [33.6, 44.5], [32.5, 45.4], [33.6, 46.0], [31.7, 46.6], [30.7, 46.5], [29.6, 45.4], [28.6, 44.3], [27.9, 42.8]],
    [[26.2, 40.3], [26.7, 40.5], [27.5, 40.4], [29.0, 40.9], [29.1, 41.2], [28.0, 41.2], [27.0, 40.9], [26.0, 40.8]],
    // the Red Sea with the gulfs of Suez and Aqaba
    [[32.6, 29.9], [33.4, 28.2], [34.3, 27.7], [34.9, 29.5], [34.7, 28.2], [35.6, 26.9], [36.9, 25.0], [38.2, 22.5], [39.4, 20.0], [41.5, 14.0],
     [43.3, 12.6], [42.6, 14.5], [41.2, 17.0], [39.0, 21.3], [37.2, 24.5], [35.5, 26.8], [33.9, 27.6], [32.6, 29.5]],
    // the Persian Gulf
    [[48.0, 30.0], [50.0, 30.0], [51.5, 27.8], [54.0, 26.6], [56.3, 27.2], [56.4, 26.2], [54.0, 24.2], [52.0, 24.0], [51.5, 25.5], [50.8, 24.8], [50.1, 26.5],
     [49.0, 27.5], [48.0, 29.0]],
    // the Caspian
    [[47.0, 44.5], [49.0, 46.5], [52.5, 46.5], [53.0, 45.0], [51.3, 44.5], [52.7, 42.5], [53.0, 40.5], [54.0, 37.4], [51.5, 36.8], [49.0, 37.6], [49.4, 40.2],
     [48.6, 41.8], [47.5, 43.0]],
    // the Atlantic, off the left edge
    [[-20, 62], [-4.6, 62], [-4.6, 48.5], [-1.2, 46.2], [-1.8, 43.4], [-8.0, 43.7], [-9.3, 42.9], [-8.8, 41.2], [-9.5, 38.8], [-8.8, 37.0], [-6.4, 36.8],
     [-5.6, 36.0], [-5.9, 35.8], [-6.8, 34.0], [-9.6, 30.4], [-16, 22], [-20, 0]],
    // the Arabian Sea, off the bottom right
    [[43.3, 12.6], [45.0, 13.0], [48.5, 14.0], [52.2, 16.0], [55.5, 17.8], [57.8, 19.0], [59.8, 22.4], [58.0, 23.7], [56.4, 26.2], [57.3, 25.8],
     [61.6, 25.2], [66.0, 25.0], [80, 20], [80, 0], [43.3, 0]],
  ],
  islands: [
    [[12.4, 38.0], [13.4, 38.2], [15.6, 38.3], [15.1, 37.4], [15.1, 36.7], [14.3, 37.0], [12.5, 37.6]],          // Sicily
    [[8.4, 39.0], [9.6, 39.1], [9.8, 40.9], [9.2, 41.3], [8.2, 40.9], [8.4, 39.9]],                             // Sardinia
    [[8.6, 41.4], [9.4, 41.4], [9.5, 42.8], [8.7, 42.6]],                                                       // Corsica
    [[23.5, 35.3], [24.3, 35.6], [26.3, 35.3], [25.8, 35.0], [24.7, 35.1], [23.6, 35.2]],                      // Crete
    [[32.3, 34.8], [33.0, 34.6], [34.0, 35.0], [34.6, 35.7], [33.0, 35.4], [32.3, 35.1]],                      // Cyprus
    [[26.0, 38.1], [26.6, 38.2], [26.4, 39.1], [25.9, 39.0]], [[24.3, 37.6], [25.0, 37.8], [24.7, 38.0]],    // a few Aegean islands
    [[26.6, 36.5], [27.2, 36.8], [27.0, 37.1]], [[28.0, 36.1], [28.2, 36.5], [27.7, 36.2]],
  ],
  city: {
    jerusalem: [35.2, 31.8], babylon: [44.4, 32.5], susa: [48.3, 32.2], persepolis: [52.9, 29.9], sardis: [28.0, 38.5], alexandria: [29.9, 31.2],
    antioch: [36.2, 36.2], seleucia_p: [35.93, 36.12], athens: [23.7, 38.0], rome: [12.5, 41.9], corinth: [22.9, 37.9], ephesus: [27.3, 37.9], thessalonica: [22.9, 40.6],
    philippi: [24.3, 41.0], damascus: [36.3, 33.5], tarsus: [34.9, 36.9], pella: [22.5, 40.8], carthage: [10.3, 36.9], cyrene: [21.9, 32.8],
    brundisium: [17.9, 40.6], dyrrachium: [19.4, 41.3], byzantium: [29.0, 41.0], memphis: [31.2, 29.8], elephantine: [32.9, 24.1], ecbatana: [48.5, 34.8],
    caesarea: [34.9, 32.5], puteoli: [14.1, 40.8], syracuse: [15.3, 37.1], massilia: [5.4, 43.3], capua: [14.2, 41.1], ancyra: [32.9, 39.9],
    pisidian: [31.2, 38.3], iconium: [32.5, 37.9], troas: [26.2, 39.8], nazareth: [35.3, 32.7], bethlehem: [35.2, 31.7], tyre: [35.2, 33.3],
    gaza: [34.45, 31.5], issus: [36.2, 36.8], gaugamela: [43.4, 36.4], hellespont: [26.4, 40.2], gades: [-6.3, 36.5], tarraco: [1.2, 41.1],
    salamis: [33.9, 35.2], seleucia: [44.5, 33.1], ctesiphon: [44.6, 33.1], petra: [35.4, 30.3], aquileia: [13.4, 45.8], lugdunum: [4.8, 45.8],
  },
  // where the scattered people (and their Scriptures) went, Persian period (no Alexandria or Cyrene: those communities begin after Alexander)
  diaspora: [['jerusalem', 'babylon'], ['babylon', 'susa'], ['babylon', 'ecbatana'], ['jerusalem', 'memphis'], ['memphis', 'elephantine'],
    ['babylon', 'sardis'], ['jerusalem', 'damascus'], ['babylon', 'persepolis']],
  // Alexander, 334–323 BC
  alexander: ['pella', 'hellespont', 'sardis', 'issus', 'tyre', 'gaza', 'memphis', 'alexandria', 'memphis', 'tyre', 'gaugamela', 'babylon', 'susa', 'persepolis', [60, 33]],
  // Roman roads (the great trunk lines only)
  roads: [
    ['rome', 'capua', 'brundisium'],                                            // Via Appia
    ['dyrrachium', 'thessalonica', 'philippi', 'byzantium'],                    // Via Egnatia
    ['byzantium', 'ancyra', 'tarsus', 'antioch'],
    ['troas', 'ephesus', 'sardis', 'pisidian', 'iconium', 'tarsus'],
    ['antioch', 'damascus', 'caesarea', 'jerusalem'], ['caesarea', 'gaza', 'alexandria'], ['damascus', 'petra'],
    ['alexandria', 'cyrene', 'carthage'],
    ['rome', 'massilia', 'tarraco', [-1, 38.5], 'gades'],                       // Via Aurelia / Domitia / Augusta
    ['rome', 'aquileia'], ['massilia', 'lugdunum', [3, 49]], ['antioch', 'seleucia'], ['thessalonica', 'athens', 'corinth'],
  ],
  // sea lanes (Pompey cleared the pirates, 67 BC)
  lanes: [['alexandria', 'puteoli'], ['brundisium', 'dyrrachium'], ['corinth', 'puteoli'], ['ephesus', 'corinth'], ['caesarea', 'salamis', 'antioch'],
    ['carthage', 'syracuse', 'puteoli'], ['alexandria', 'caesarea'], ['troas', 'philippi']],
  // Paul's journeys (Acts 13–14, 15:36–18:22, 18:23–21:17) and the voyage to Rome (Acts 27–28), simplified
  paul: [
    ['antioch', 'seleucia_p', 'salamis', [32.4, 34.75], [30.85, 36.96], 'pisidian', 'iconium', [32.35, 37.6], [33.4, 37.35], 'tarsus', 'antioch'],
    ['antioch', 'tarsus', [33.4, 37.35], [32.35, 37.6], 'iconium', 'pisidian', 'troas', 'philippi', 'thessalonica', [22.2, 40.5], 'athens', 'corinth', 'ephesus', 'caesarea', 'jerusalem'],
    ['caesarea', [35.37, 33.56], [29.98, 36.26], [24.8, 34.93], [14.4, 35.9], 'syracuse', [15.65, 38.1], 'puteoli', 'rome'],
  ],
  // cities whose synagogue lamps light (Acts 15:21)
  synagogues: ['rome', 'corinth', 'athens', 'thessalonica', 'philippi', 'ephesus', 'pisidian', 'iconium', 'tarsus', 'antioch', 'damascus', 'alexandria',
    'cyrene', 'jerusalem', 'salamis', 'puteoli', 'babylon', 'caesarea', 'sardis', 'troas'],
};
