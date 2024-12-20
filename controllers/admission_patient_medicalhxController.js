const { Patient, MedicalHx, Admission,Staff } = require('../models');

// // Register a new patient, medical history, and admission
// exports.register = async (req, res) => {
//   console.log("patient")
//   try {
//     const patientData = req.body;
//     console.log(req.body)
    

//     const patient = await Patient.create({
//       phn: patientData.phn,
//       full_name: patientData.fname,
//       address: patientData.address,
//       nic: patientData.nic,
//       dob: patientData.dob,
//       marital_status: patientData.status,
//       phone_no: patientData.tp,
//       blood_gr: patientData.bloodgr
//     });

//     const medicalHx = await MedicalHx.create({
//       phn: patientData.phn,
//       allergy: patientData.allergy,
//       past_med: patientData.past_med.join(', '),
//       past_med_other: patientData.past_med_other,
//       past_surg: patientData.past_surg.join(', '),
//       past_surg_other: patientData.past_surg_other,
//       hx_diseases: patientData.hx_diseases,
//       hx_cancer: patientData.hx_cancer.join(', '),
//       hx_cancer_other: patientData.hx_cancer_other,
//       diagnosis: patientData.diagnosis,
//       height: patientData.height,
//       weight: patientData.weight,
//       menarche_age: patientData.menarche_age,
//       menopausal_age: patientData.menopausal_age,
//       lmp: patientData.lmp,
//       menstrual_cycle: patientData.menstrual_cycle
//     });

//     const admission = await Admission.create({
//       date: patientData.date,
//       phn: patientData.phn,
//       bht: patientData.bht,
//       ward_no: patientData.ward,
//       consultant: patientData.consultant,
//       add_count: patientData.add_count
//     });

//     return res.status(200).json({ patient, medicalHx, admission });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to register patient' });
//   }
// };
// //data patient list
// exports.details = (req, res) => {
//   const limit = req.query.limit || 20; // Default limit to 20 if not provided
//   const page = parseInt(req.query.page) || 1;
//     const offset = (page - 1) * limit;

//   Patient.findAll({ limit , offset   })
//     .then((patientList) => {
//       res.json(patientList);
//     })
//     .catch((err) => {
//       console.error(err);
//       res.status(500).send('Error retrieving data from the staff table');
//     });
// };

// // Register new admission
// exports.newAdmission = async (req, res) => {
//   try {
//     const admissionData = req.body;

//     const admission = await Admission.create({
//       date: admissionData.date,
//       phn: admissionData.phn,
//       bht: admissionData.bht,
//       ward_no: admissionData.ward,
//       consultant: admissionData.consultant,
//       add_count: admissionData.add_count
//     });

//     res.status(200).json({ admission });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to create new admission' });
//   }
// };

// // Get admission count for a patient
// exports.getAdmissionCount = async (req, res) => {
//   try {
//     const admissions = await Admission.findAll({
//       where: { phn: req.params.id },
//       order: [['add_count', 'DESC']],
//       limit: 1
//     });

//     res.status(200).json(admissions);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Error retrieving admission count' });
//   }
// };

// // Update patient details
// exports.updatePatient = async (req, res) => {
//   try {
//     const patient = await Patient.update(req.body, {
//       where: { id: req.params.id },
//       returning: true
//     });

//     if (!patient[0]) {
//       return res.status(404).json({ error: 'Patient not found' });
//     }

//     res.status(200).json(patient[1][0]);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to update patient details' });
//   }
// };

// // Update medical history
// exports.updateMedicalHistory = async (req, res) => {
//   try {
//     const medicalHx = await MedicalHx.update(req.body, {
//       where: { phn: req.params.phn },
//       returning: true
//     });

//     if (!medicalHx[0]) {
//       return res.status(404).json({ error: 'Medical history not found' });
//     }

//     res.status(200).json(medicalHx[1][0]);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to update medical history' });
//   }
// };

// // Update admission
// exports.updateAdmission = async (req, res) => {
//   try {
//     const admission = await Admission.update(req.body, {
//       where: { phn: req.params.phn, add_count: req.params.add_count },
//       returning: true
//     });

//     if (!admission[0]) {
//       return res.status(404).json({ error: 'Admission not found' });
//     }

//     res.status(200).json(admission[1][0]);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to update admission' });
//   }
// };

// // Get patient details
// exports.getPatientDetails = async (req, res) => {
//   try {
//     const patient = await Patient.findOne({
//       where: { id: req.params.id },
//       attributes: [
//         'id',
//         'full_name',
//         'blood_gr',
//         'phn',
//         'phone_no',
//         'address',
//         'dob',
//         'marital_status',
//         'nic',
//         [sequelize.literal('FLOOR(DATEDIFF(CURRENT_DATE(), dob) / 365)'), 'age']
//       ]
//     });

//     if (!patient) {
//       return res.status(404).json({ error: 'Patient not found' });
//     }

//     res.status(200).json(patient);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to retrieve patient details' });
//   }
// };
// const { Patient, MedicalHx, Admission } = require('../models');

// Create or update a patient, medical history, and admission
// exports.createOrUpdatePatient = async (req, res) => {
//     const { 
//         phn, fname, address, nic, dob, status, tp, bloodgr,
//         allergy, past_med, past_med_other, past_surg, past_surg_other,
//         hx_diseases, hx_cancer, hx_cancer_other, diagnosis, height, weight, 
//         menarche_age, menopausal_age, lmp, menstrual_cycle, 
//         date, bht, ward, consultant, add_count
//     } = req.body;

//     try {
//         // First check if patient exists
//         let patient = await Patient.findOne({ where: { phn } });
        
//         if (!patient) {
//             // Insert patient data if not exists
//             patient = await Patient.create({
//                 phn, full_name: fname, address, nic, dob, marrital_status: status,
//                 phone_no: tp, blood_gr: bloodgr
//             });
//         }

//         // Insert or update medical history
//         const medicalHx = await MedicalHx.findOne({ where: { phn } });

//         if (!medicalHx) {
//             await MedicalHx.create({
//                 phn, allergy, past_med: past_med.join(', '), past_med_other, 
//                 past_surg: past_surg.join(', '), past_surg_other, 
//                 hx_diseases, hx_cancer: hx_cancer.join(', '), hx_cancer_other, 
//                 diagnosis, height, weight, menarche_age, menopausal_age, 
//                 lmp, menstrual_cycle
//             });
//         } else {
//             await medicalHx.update({
//                 allergy, past_med: past_med.join(', '), past_med_other, 
//                 past_surg: past_surg.join(', '), past_surg_other, 
//                 hx_diseases, hx_cancer: hx_cancer.join(', '), hx_cancer_other, 
//                 diagnosis, height, weight, menarche_age, menopausal_age, 
//                 lmp, menstrual_cycle
//             });
//         }

//         // Insert admission record
//         const admission = await Admission.create({
//             date, phn, bht, ward_no: ward, consultant, add_count
//         });

//         res.status(200).json({ patient, medicalHx, admission });

//     } catch (error) {
//         console.error('Error in creating/updating patient:', error);
//         res.status(500).json({ error: 'Error creating/updating patient data', details: error });
//     }
// };

// Register a new patient, medical history, and admission
exports.register = async (req, res) => {
  console.log("patient")
  try {
    const patientData = req.body;
    console.log(req.body)
    

    const patient = await Patient.create({
      phn: patientData.phn,
      full_name: patientData.fname,
      address: patientData.address,
      nic: patientData.nic,
      dob: patientData.dob,
      marital_status: patientData.status,
      phone_no: patientData.phone_no,
      blood_gr: patientData.bloodgr
    });

    const medicalHx = await MedicalHx.create({
      phn: patientData.phn,
      allergy: patientData.allergy,
      past_med: patientData.past_med.join(', '),
      past_med_other: patientData.past_med_other,
      past_surg: patientData.past_surg.join(', '),
      past_surg_other: patientData.past_surg_other,
      hx_diseases: patientData.hx_diseases,
      hx_cancer: patientData.hx_cancer.join(', '),
      hx_cancer_other: patientData.hx_cancer_other,
      diagnosis: patientData.diagnosis,
      menarche_age: patientData.menarche_age,
      menopausal_age: patientData.menopausal_age,
      lmp: patientData.lmp,
      menstrual_cycle: patientData.menstrual_cycle
    });

    const admission = await Admission.create({
      date: patientData.date,
      phn: patientData.phn,
      bht: patientData.bht,
      ward_no: patientData.ward,
      consultant: patientData.consultant,
      add_count: patientData.add_count,
      height: patientData.height,
      weight: patientData.weight
    });

    return res.status(200).json({ patient, medicalHx, admission });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to register patient' });
  }
};



exports.details = (req, res) => {
  // Parse limit and page parameters to ensure they are integers
  let limit = parseInt(req.query.limit) || 20; // Default limit to 20 if not provided
  const page = parseInt(req.query.page) || 1;  // Default page to 1 if not provided
  const offset = (page - 1) * limit;

  // Ensure limit is a valid number
  if (isNaN(limit) || limit <= 0) {
    return res.status(400).send('Invalid limit value');
  }

  Patient.findAll({
    limit: limit,
    offset: offset
  })
    .then((patientList) => {
      res.json(patientList);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error retrieving data from the patient table');
    });
};


const Sequelize = require('sequelize');

exports.getPatientDetails = async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.id, {
            attributes: {
                include: [
                    // Calculate age by finding the difference in days from the date of birth
                    [Sequelize.literal("FLOOR(DATEDIFF(CURRENT_DATE(), dob) / 365)"), "age"]
                ]
            }
        });

        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        // Convert the Sequelize instance to a plain object
        const patientData = patient.get({ plain: true });

        // Send the patient data as a JSON response, including the age
        res.json(patientData);
    } catch (error) {
        console.error('Error fetching patient details:', error);
        res.status(500).json({ error: 'Error fetching patient details', details: error });
    }
};



// Get patient medical history
exports.getMedicalHistory = async (req, res) => {
    try {
        const medicalHx = await MedicalHx.findOne({ where: { phn: req.params.phn } });
        if (!medicalHx) {
            return res.status(404).json({ error: 'Medical history not found' });
        }
        res.json(medicalHx);
    } catch (error) {
        console.error('Error fetching medical history:', error);
        res.status(500).json({ error: 'Error fetching medical history', details: error });
    }
};

// Get admission details by phn
exports.getAdmissionDetails = async (req, res) => {
    try {
        const admission = await Admission.findOne({ where: { phn: req.params.phn, add_count: req.params.add_count } });
        if (!admission) {
            return res.status(404).json({ error: 'Admission details not found' });
        }
        res.json(admission);
    } catch (error) {
        console.error('Error fetching admission details:', error);
        res.status(500).json({ error: 'Error fetching admission details', details: error });
    }
};

// Update patient details
exports.updatePatient = async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.id);
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        await patient.update({
            phn: req.body.phn,
            full_name: req.body.fname,
            address: req.body.address,
            nic: req.body.nic,
            dob: req.body.dob,
            marrital_status: req.body.status,
            phone_no: req.body.tp,
            blood_gr: req.body.bloodgr
        });

        res.json({ message: 'Patient information updated successfully', patient });
    } catch (error) {
        console.error('Error updating patient information:', error);
        res.status(500).json({ error: 'Error updating patient information', details: error });
    }
};

// Update medical history
exports.updateMedicalHistory = async (req, res) => {
    try {
        const medicalHx = await MedicalHx.findOne({ where: { phn: req.params.phn } });
        if (!medicalHx) {
            return res.status(404).json({ error: 'Medical history not found' });
        }

        await medicalHx.update({
            allergy: req.body.allergy,
            past_med: req.body.past_med.join(', '),
            past_med_other: req.body.past_med_other,
            past_surg: req.body.past_surg.join(', '),
            past_surg_other: req.body.past_surg_other,
            hx_diseases: req.body.hx_diseases,
            hx_cancer: req.body.hx_cancer.join(', '),
            hx_cancer_other: req.body.hx_cancer_other,
            diagnosis: req.body.diagnosis,
            height: req.body.height,
            weight: req.body.weight,
            menarche_age: req.body.menarche_age,
            menopausal_age: req.body.menopausal_age,
            lmp: req.body.lmp,
            menstrual_cycle: req.body.menstrual_cycle
        });

        res.json({ message: 'Medical history updated successfully' });
    } catch (error) {
        console.error('Error updating medical history:', error);
        res.status(500).json({ error: 'Error updating medical history', details: error });
    }
};

// Update admission status
exports.updateAdmissionStatus = async (req, res) => {
    try {
        const admission = await Admission.findOne({ where: { phn: req.params.phn, add_count: req.params.add_count } });
        if (!admission) {
            return res.status(404).json({ error: 'Admission not found' });
        }

        await admission.update({ status: 'discharged' });

        res.json({ message: 'Admission status updated to discharged' });
    } catch (error) {
        console.error('Error updating admission status:', error);
        res.status(500).json({ error: 'Error updating admission status', details: error });
    }
};

// Get all admissions for a specific patient
exports.getAllAdmissionsForPatient = async (req, res) => {
    try {
        const admissions = await Admission.findAll({ where: { phn: req.params.phn } });
        res.json(admissions);
    } catch (error) {
        console.error('Error fetching admissions:', error);
        res.status(500).json({ error: 'Error fetching admissions', details: error });
    }
};

exports.reqCount= async (req, res) => {
    try {
        // Fetch the phn and add_count for the specific id, ordered by add_count descending, and limit to 1 result
        const result = await Admission.findOne({
            attributes: ['phn', 'add_count'],  // Specify the columns to fetch
            where: {
                phn: req.params.id  // Filter by the phn (id) passed in the route
            },
            order: [
                ['add_count', 'DESC']  // Order by add_count in descending order
            ]
        });

        // Check if a result is found
        if (!result) {
            return res.status(404).json({ message: 'No record found' });
        }

        // Send the result as a JSON response
        res.json(result);
    } catch (err) {
        // Log the error and send a response with the error message
        console.error('Error fetching data from database:', err);
        res.status(500).send('Error retrieving data from database');
    }
}

const { Op } = require('sequelize'); // Make sure to import Op

exports.getStaff = async (req, res) => {
  // Use Sequelize model to query the staff table where role is 'consultant', 'medical_officer', or 'registrar'
  Staff.findAll({
    where: {
      role: {
        [Op.in]: ['consultant', 'medical_officer', 'registrar'] // Check for multiple roles
      }
    }
  })
    .then((results) => {
      res.status(200).json(results); // Return the results as a JSON response
    })
    .catch((err) => {
      console.error('Database query error:', err); // Log error if the query fails
      res.status(500).json({ error: err.message }); // Return error message in case of failure
    });
};

exports.counsult = async (req, res) => {
  // Use Sequelize model to query the staff table where role is 'consultant'
  Staff.findAll({
    where: {
      role: 'consultant',
    }
  })
    .then((results) => {
      res.status(200).json(results);
    })
    .catch((err) => {
      console.error('Database query error:', err);
      res.status(500).json({ error: err.message });
    });
}
// Register new admission
exports.newAdmission = async (req, res) => {
  try {
    const admissionData = req.body;

    const admission = await Admission.create({
      date: admissionData.date,
      phn: admissionData.phn,
      bht: admissionData.bht,
      ward_no: admissionData.ward,
      consultant: admissionData.consultant,
      add_count: admissionData.add_count
    });

    res.status(200).json({ admission });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create new admission' });
  }
};


exports.searchData = async (req, res) => {
  const { val } = req.query;
  const limit = 10;

  if (!val || val.trim() === '') {
    return res.json([]);
  }

  const conditions = {
    [Op.or]: [] // We'll use an OR condition for phn and nic, or full_name
  };

  if (!isNaN(val)) {
    conditions[Op.or].push({
      phn: { [Op.like]: `%${val}%` }
    }, {
      nic: { [Op.like]: `%${val}%` }
    });
  } else {
    conditions[Op.or].push({
      full_name: { [Op.like]: `%${val}%` }
    });
  }

  try {
    const patients = await Patient.findAll({
      where: conditions,
      limit: limit,
      attributes: ['id', 'full_name', 'nic', 'phn']
    });
    res.json(patients);
  } catch (err) {
    console.error('Error retrieving data from database:', err);
    res.status(500).send('Database error');
  }
}

exports.dischargePatient = async (req, res) => {
  const phn = req.params.phn;

  try {
    const result = await Patient.update(
      { admit_status: 'discharged' },
      { where: { phn: phn } }
    );
    res.json(result);
  } catch (err) {
    res.status(500).send('Error discharging data from database');
  }
}

exports.admitDetail = async (req, res) => {
  const limit = parseInt(req.query.limit) || 8;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * limit;

  try {
    const patients = await Patient.findAll({
      where: { admit_status: 'admitted' },
      limit: limit,
      offset: offset
    });
    res.json(patients);
  } catch (err) {
    console.error('Error retrieving admitted data:', err);
    res.status(500).send('Error retrieving admitted data from database');
  }
}

exports.dischargeDetail = async (req, res) => {
  const limit = parseInt(req.query.limit) || 8;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * limit;

  try {
    const patients = await Patient.findAll({
      where: { admit_status: 'discharged' },
      limit: limit,
      offset: offset
    });
    res.json(patients);
  } catch (err) {
    console.error('Error retrieving discharged data:', err);
    res.status(500).send('Error retrieving discharged data from database');
  }
}