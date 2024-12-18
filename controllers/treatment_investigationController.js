const { Treatment, Investigation } = require('../models'); // Adjust the path according to your project structure

// POST request for creating treatment and investigation records
exports.createTreatmentAndInvestigation = async (req, res) => {
    console.log(req.body);
  try {
    const {
      date,
      visit_id,
      admission_id,
      visit_no,
      seenBy,
      complaints,
      abnormalUlerine,
      otherComplaint,
      bpa,
      bpb,
      pr,
      abdominalExam,
      gynaecologyExam,
      minorEua,
      minorEb,
      major,
      medicalManage,
      surgicalManage,
      wbc,
      hb,
      plate,
      whiteCell,
      redCell,
      protein,
      seK,
      seNa,
      crp,
      fbs,
      ppbsAB,
      ppbsAL,
      ppbsAD,
      lftALT,
      lftAST,
      lftOther,
      scan_types,
      mri,
      ct,
      tas,
      tus
    } = req.body;

    // Create treatment record
    const treatment = await Treatment.create({
      date,
      visit_id,
      admission_id,
      visit_count:visit_no,
      seen_by: seenBy,
      complaints: complaints.join(', '),
      abnormal_bleeding: abnormalUlerine.join(', '),
      complaint_other: otherComplaint,
      exam_bp: bpa,
      exam_pulse: pr,
      exam_abdominal: abdominalExam,
      exam_gynaecology: gynaecologyExam,
      manage_minor_eua: minorEua,
      manage_minor_eb: minorEb,
      manage_major: major.join(', '),
      manage_medical: medicalManage,
      manage_surgical: surgicalManage,
      diagnosis: '', // Add diagnosis if necessary
    });

    // Create investigation record
    const investigation = await Investigation.create({
      visit_id,
      fbc_wbc: wbc,
      fbc_hb: hb,
      fbc_pt: plate,
      ufr_wc: whiteCell,
      ufr_rc: redCell,
      ufr_protein: protein,
      se_k: seK,
      se_na: seNa,
      crp: crp,
      fbs: fbs,
      ppbs_ab: ppbsAB,
      ppbs_al: ppbsAL,
      ppbs_ad: ppbsAD,
      lft_alt: lftALT,
      lft_ast: lftAST,
      invest_other: lftOther,
      scan_mri: mri,
      scan_ct: ct,
      uss_tas: tas,
      uss_tus: tus,
      scan_types: scan_types.join(', ')
    });

    // Respond with created treatment and investigation records
    res.status(201).json({ treatment, investigation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating treatment and investigation records', details: err.message });
  }
};

// GET request for treatment records by visit_id
exports.getTreatmentByVisit = async (req, res) => {
  const { visit_un } = req.params;
  try {
    const treatments = await Treatment.findAll({
      where: {
        visit_id: {
          [Sequelize.Op.like]: `${visit_un}%`
        }
      }
    });
    res.status(200).json(treatments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error retrieving treatments', details: err.message });
  }
};

// GET request for detailed treatment and investigation records by visit_id
// const { Treatment, Investigation, Sequelize } = require('../models');

// GET request for detailed treatment and investigation records by visit_id
exports.getTreatmentAndInvestigationDetail = async (req, res) => {
  const { visit_unique } = req.params;

  try {
    // Query for treatment data and include all the investigation fields
    const result = await Treatment.findOne({
      where: { visit_id: visit_unique },
      include: [{
        model: Investigation,
        where: { visit_id: visit_unique },
        required: true, // Ensure treatment is returned only if it has a related investigation
        attributes: [
          'crp', 'fbc_hb', 'fbc_pt', 'fbc_wbc', 'fbs', 'lft_alt', 'lft_ast', 'ppbs_ab',
          'ppbs_ad', 'ppbs_al', 'scan_ct', 'scan_mri', 'scan_types', 'se_k', 'se_na',
          'ufr_protein', 'ufr_rc', 'ufr_wc', 'uss_tas', 'uss_tus' // Add all the fields you want
        ], // Select all the fields you want from investigation
      }],
      attributes: { exclude: ['Investigations'] }, // Exclude the full investigation object
    });

    if (!result) {
      return res.status(404).json({ error: 'No data found for the specified visit' });
    }

    // Convert result to plain JavaScript object (without Sequelize methods)
    const treatmentData = result.get({ plain: true }); 

    // Access and flatten investigation fields
    const investigationsData = treatmentData.Investigations ? treatmentData.Investigations[0] : {}; // Get the first investigation record if it exists

    // Flatten the data by combining treatment data and investigations data
    const flattenedData = { 
      ...treatmentData, // Spread treatment data
      ...investigationsData, // Spread investigation data (all fields from investigation)
    };

    // Delete the Investigations field to avoid returning nested structure
    delete flattenedData.Investigations;

    // Send the flattened data as the response
    res.status(200).json(flattenedData);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error retrieving treatment and investigation details', details: err.message });
  }
};



// PUT request to update treatment and investigation records by visit_id
exports.updateTreatmentAndInvestigation = async (req, res) => {
  const { visit_unique } = req.params;
  const {
    date,
    seenBy,
    complaints = [],
    abnormalUlerine = [],
    otherComplaint,
    bpa,
    bpb,
    pr,
    abdominalExam,
    gynaecologyExam,
    minorEua,
    minorEb,
    major = [],
    medicalManage,
    surgicalManage,
    wbc,
    hb,
    plate,
    whiteCell,
    redCell,
    protein,
    seK,
    seNa,
    crp,
    fbs,
    ppbsAB,
    ppbsAL,
    ppbsAD,
    lftALT,
    lftAST,
    lftOther,
    scan_types = [],
    mri,
    ct,
    tas,
    tus
  } = req.body;

  try {
    // Update treatment record
    const updatedTreatment = await Treatment.update({
      date,
      seen_by: seenBy,
      complaints: complaints.join(', '),
      abnormal_bleeding: abnormalUlerine.join(', '),
      complaint_other: otherComplaint,
      exam_bp: bpa,
      exam_pulse: pr,
      exam_abdominal: abdominalExam,
      exam_gynaecology: gynaecologyExam,
      manage_minor_eua: minorEua,
      manage_minor_eb: minorEb,
      manage_major: major.join(', '),
      manage_medical: medicalManage,
      manage_surgical: surgicalManage,
      diagnosis: '' // Add diagnosis if needed
    }, {
      where: { visit_id: visit_unique }
    });

    // Update investigation record
    const updatedInvestigation = await Investigation.update({
      fbc_wbc: wbc,
      fbc_hb: hb,
      fbc_pt: plate,
      ufr_wc: whiteCell,
      ufr_rc: redCell,
      ufr_protein: protein,
      se_k: seK,
      se_na: seNa,
      crp: crp,
      fbs: fbs,
      ppbs_ab: ppbsAB,
      ppbs_al: ppbsAL,
      ppbs_ad: ppbsAD,
      lft_alt: lftALT,
      lft_ast: lftAST,
      invest_other: lftOther,
      scan_mri: mri,
      scan_ct: ct,
      uss_tas: tas,
      uss_tus: tus,
      scan_types: scan_types.join(', ')
    }, {
      where: { visit_id: visit_unique }
    });

    res.status(200).json({ message: 'Visit information updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating treatment and investigation records', details: err.message });
  }
};

const Sequelize = require('sequelize');

exports.reqCount= async (req, res) => {
    const visitUn = req.params.visit_un;
    console.log(visitUn)
    
    try {
        // Use Sequelize to get the count of visits that match the pattern
        const visitCount = await Treatment.count({
            where: {
                visit_id: {
                    [Sequelize.Op.like]: `${visitUn}%`  // Use LIKE operator to match the visit_id
                }
            }
        });

        return res.status(200).json({ visit_count: visitCount });
    } catch (err) {
        console.error("Error fetching visit count:", err);
        return res.status(500).json({ error: "Error fetching visit count", details: err });
    }
}