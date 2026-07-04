/* ==========================================================================
   AgriGuard AI — Shared sample dataset (no backend, in-memory only)
   ========================================================================== */

const AG_DATA = (function(){

  const species = ["Dairy Cattle","Beef Cattle","Poultry — Broiler","Poultry — Layer","Swine","Sheep","Goat"];
  const farms = ["Green Valley Unit", "Riverside Block A", "Riverside Block B", "Hilltop Pasture", "North Barn"];
  const drugNames = [
    {name:"Oxytetracycline", class:"Tetracycline", withdrawal:21},
    {name:"Enrofloxacin", class:"Fluoroquinolone", withdrawal:14},
    {name:"Amoxicillin", class:"Beta-lactam (Penicillin)", withdrawal:10},
    {name:"Ceftiofur", class:"Cephalosporin", withdrawal:7},
    {name:"Tylosin", class:"Macrolide", withdrawal:18},
    {name:"Sulfadimethoxine", class:"Sulfonamide", withdrawal:12},
    {name:"Streptomycin", class:"Aminoglycoside", withdrawal:30},
    {name:"Florfenicol", class:"Amphenicol", withdrawal:28}
  ];

  function seedRandom(seed){
    let s = seed;
    return function(){
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }
  const rand = seedRandom(42);
  function pick(arr){ return arr[Math.floor(rand()*arr.length)]; }
  function randInt(min,max){ return Math.floor(rand()*(max-min+1))+min; }

  // ---- Animals ----
  const animals = [];
  for(let i=1;i<=42;i++){
    const sp = pick(species);
    const tagPrefix = sp.includes("Poultry") ? "PLT" : sp==="Swine" ? "SWN" : sp.includes("Cattle") ? "CTL" : sp==="Sheep" ? "SHP" : "GOT";
    const status = rand() > 0.82 ? "Under Treatment" : (rand() > 0.9 ? "Withdrawal Period" : "Healthy");
    animals.push({
      id: `${tagPrefix}-${1000+i}`,
      name: `${sp.split(" ")[0]} ${i}`,
      species: sp,
      farm: pick(farms),
      age: randInt(2,48),
      weight: sp.includes("Poultry") ? randInt(1,3) : sp==="Swine" ? randInt(60,140) : randInt(150,650),
      status: status,
      lastCheck: `2026-0${randInt(5,6)}-${String(randInt(1,28)).padStart(2,'0')}`,
      health: randInt(78,99)
    });
  }

  // ---- Medicine / AMU records ----
  const amuRecords = [];
  for(let i=1;i<=30;i++){
    const drug = pick(drugNames);
    const animal = pick(animals);
    const dateAdmin = `2026-0${randInt(5,6)}-${String(randInt(1,28)).padStart(2,'0')}`;
    const withdrawalEnd = new Date(dateAdmin);
    withdrawalEnd.setDate(withdrawalEnd.getDate() + drug.withdrawal);
    const today = new Date("2026-07-05");
    const daysLeft = Math.ceil((withdrawalEnd - today) / (1000*60*60*24));
    amuRecords.push({
      id: `AMU-${2000+i}`,
      animalId: animal.id,
      animalName: animal.name,
      drug: drug.name,
      drugClass: drug.class,
      dosage: `${randInt(5,20)} mg/kg`,
      route: pick(["Intramuscular","Oral","Subcutaneous","Intravenous"]),
      dateAdmin: dateAdmin,
      withdrawalDays: drug.withdrawal,
      withdrawalEnd: withdrawalEnd.toISOString().slice(0,10),
      daysLeft: daysLeft,
      status: daysLeft > 0 ? "In Withdrawal" : "Cleared",
      vet: pick(["Dr. Meera Nair","Dr. Arjun Rao","Dr. Priya Iyer","Dr. Sanjay Kumar"])
    });
  }

  // ---- MRL Monitoring ----
  const mrlSubstances = [
    {substance:"Oxytetracycline", tissue:"Muscle", limit:100, unit:"µg/kg"},
    {substance:"Enrofloxacin", tissue:"Liver", limit:200, unit:"µg/kg"},
    {substance:"Amoxicillin", tissue:"Milk", limit:4, unit:"µg/kg"},
    {substance:"Ceftiofur", tissue:"Kidney", limit:6000, unit:"µg/kg"},
    {substance:"Tylosin", tissue:"Fat", limit:100, unit:"µg/kg"},
    {substance:"Sulfadimethoxine", tissue:"Muscle", limit:100, unit:"µg/kg"},
    {substance:"Streptomycin", tissue:"Kidney", limit:1000, unit:"µg/kg"},
    {substance:"Florfenicol", tissue:"Liver", limit:3000, unit:"µg/kg"}
  ];
  const mrlTests = [];
  for(let i=1;i<=24;i++){
    const sub = pick(mrlSubstances);
    const animal = pick(animals);
    const pctOfLimit = rand() * 1.25; // can exceed
    const measured = +(sub.limit * pctOfLimit).toFixed(2);
    const compliant = measured <= sub.limit;
    mrlTests.push({
      id: `MRL-${3000+i}`,
      animalId: animal.id,
      animalName: animal.name,
      farm: animal.farm,
      substance: sub.substance,
      tissue: sub.tissue,
      limit: sub.limit,
      unit: sub.unit,
      measured: measured,
      compliant: compliant,
      testDate: `2026-0${randInt(5,6)}-${String(randInt(1,28)).padStart(2,'0')}`,
      lab: pick(["AgriLab Chennai","VetDiagnostics South","NationalFoodSafetyLab"])
    });
  }

  // ---- Notifications ----
  const notifications = [
    {id:1, type:"alert", icon:"exclamation-triangle-fill", title:"MRL exceedance detected", body:"Enrofloxacin residue in CTL-1027 liver sample exceeds limit by 18%.", time:"12 min ago", read:false, tint:"red"},
    {id:2, type:"warning", icon:"hourglass-split", title:"Withdrawal period ending soon", body:"PLT-1014 clears Ceftiofur withdrawal in 2 days.", time:"1 hr ago", read:false, tint:"amber"},
    {id:3, type:"info", icon:"robot", title:"AI Disease Detection result ready", body:"Scan for SWN-1033 completed — mild respiratory infection suspected.", time:"3 hrs ago", read:false, tint:"blue"},
    {id:4, type:"success", icon:"check-circle-fill", title:"Batch cleared for market", body:"14 animals in Riverside Block A passed MRL compliance.", time:"Yesterday", read:true, tint:"green"},
    {id:5, type:"info", icon:"calendar-event", title:"Vet visit scheduled", body:"Dr. Priya Iyer scheduled a herd health check for July 9.", time:"Yesterday", read:true, tint:"blue"},
    {id:6, type:"warning", icon:"capsule", title:"New AMU entry required", body:"3 treated animals missing dosage records for this week.", time:"2 days ago", read:true, tint:"amber"},
    {id:7, type:"alert", icon:"exclamation-triangle-fill", title:"Sulfadimethoxine residue flagged", body:"CTL-1041 muscle tissue sample flagged for re-test.", time:"3 days ago", read:true, tint:"red"}
  ];

  // ---- KPIs ----
  const kpis = {
    totalAnimals: animals.length,
    activeTreatments: amuRecords.filter(r => r.status === "In Withdrawal").length,
    mrlCompliance: +((mrlTests.filter(t=>t.compliant).length / mrlTests.length) * 100).toFixed(1),
    alertsToday: notifications.filter(n=>!n.read).length
  };

  // ---- Chart datasets ----
  const monthlyAMU = {
    labels: ["Feb","Mar","Apr","May","Jun","Jul"],
    tetracycline: [12,15,10,14,9,7],
    fluoroquinolone: [8,9,11,7,6,5],
    penicillin: [20,18,22,19,17,15],
    other: [6,7,5,8,6,4]
  };

  const mrlComplianceTrend = {
    labels: ["Feb","Mar","Apr","May","Jun","Jul"],
    compliance: [91.2, 93.5, 90.8, 95.1, 96.4, 97.2]
  };

  const speciesDistribution = species.map(s => ({
    name: s, count: animals.filter(a=>a.species===s).length
  }));

  return { animals, amuRecords, mrlTests, mrlSubstances, notifications, kpis, monthlyAMU, mrlComplianceTrend, speciesDistribution, drugNames, farms };
})();
