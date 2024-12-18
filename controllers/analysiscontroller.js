// controllers/statsController.js
const { Patient, Admission, MedicalHx, Investigation, Treatment,  Sequelize } = require('../models');

// Stats API
exports.getStats = async (req, res) => {
  try {
    const dischargedCount = await Patient.count({
      where: { admit_status: 'discharged' },
    });

    const admittedCount = await Patient.count({
      where: { admit_status: 'admitted' },
    });

    const totalPatients = await Patient.count();

    const admissionCount = await Admission.count({
      where: {
        date: {
          [Sequelize.Op.gte]: Sequelize.literal('CURDATE() - INTERVAL 30 DAY'),
        },
      },
    });

    const admissionRate = ((admissionCount / totalPatients) * 100).toFixed(2);

    const stats = {
      total_patients: totalPatients,
      active_patients: admittedCount,
      discharged_patients: dischargedCount,
      admission_rate: `${admissionRate}%`,
    };

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error retrieving stats' });
  }
};

// Admission Stats API
// const { Admission, Sequelize } = require('../models'); // Adjust the model path if needed

exports.getAdmissionStats = async (req, res) => {
  const { view, year, month } = req.query;
  console.log(req.query);

  try {
    let whereClause = {};
    let groupByClause = '';
    let attributes = ['name', [Sequelize.fn('SUM', Sequelize.col('add_count')), 'patientCount']];
    let orderClause = [];  // Initialize an empty array for the ORDER BY clause

    if (view === 'year') {
      // Group by the YEAR of the `date` field and order by year
      groupByClause = Sequelize.fn('YEAR', Sequelize.col('date'));
      attributes = [[groupByClause, 'name'], [Sequelize.fn('SUM', Sequelize.col('add_count')), 'patientCount']];
      orderClause = [[Sequelize.fn('YEAR', Sequelize.col('date')), 'ASC']]; // Order by year in ascending order
    } else if (view === 'month' && year) {
      // Use the YEAR function in the WHERE clause and GROUP BY MONTHNAME, order by month
      whereClause = Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('date')), year);
      groupByClause = Sequelize.fn('MONTHNAME', Sequelize.col('date'));
      attributes = [[groupByClause, 'name'], [Sequelize.fn('SUM', Sequelize.col('add_count')), 'patientCount']];
      orderClause = [[Sequelize.fn('MONTH', Sequelize.col('date')), 'ASC']]; // Order by month in ascending order
    } else if (view === 'day' && year && month) {
      // Use both YEAR and MONTH in the WHERE clause and group by the day of the month, order by day
      whereClause = {
        [Sequelize.Op.and]: [
          Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('date')), year),
          Sequelize.where(Sequelize.fn('MONTH', Sequelize.col('date')), month),
        ],
      };
      groupByClause = Sequelize.fn('DAY', Sequelize.col('date'));
      attributes = [[groupByClause, 'name'], [Sequelize.fn('SUM', Sequelize.col('add_count')), 'patientCount']];
      orderClause = [[Sequelize.fn('DAY', Sequelize.col('date')), 'ASC']]; // Order by day in ascending order
    } else {
      return res.status(400).json({ error: 'Invalid parameters' });
    }

    // Execute the query with ORDER BY clause
    const stats = await Admission.findAll({
      where: whereClause,
      attributes: attributes,
      group: [groupByClause],
      order: orderClause, // Add the ORDER BY clause here
      raw: true,
    });

    console.log('stats', stats);
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error retrieving admission stats' });
  }
};


// History Stats API
exports.getHistoryStats = async (req, res) => {
  try {
    const results = await MedicalHx.findAll({
      attributes: ['past_med'],
      raw: true,
    });

    const complaintCategories = [
      "Diabetics mellitus",
      "Hypertension",
      "Hypothyroidism",
      "Bronchial asthma",
      "Epilepsy",
      "Valvular heart diseases",
      "Ishemic heart diseases",
      "Renal diseases",
      "Arthritis",
      "Hypercholesterolemia",
    ];

    const complaintCounts = complaintCategories.reduce((acc, category) => {
      acc[category] = 0;
      return acc;
    }, {});

    results.forEach((row) => {
      const complaints = row.past_med.split(',').map(c => c.trim());
      complaints.forEach((complaint) => {
        if (complaintCounts.hasOwnProperty(complaint)) {
          complaintCounts[complaint]++;
        }
      });
    });

    const formattedData = Object.keys(complaintCounts).map((category) => ({
      name: category,
      value: complaintCounts[category],
    }));

    res.json(formattedData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error retrieving complaints data' });
  }
};

// Report Analysis API
exports.getReportAnalysis = async (req, res) => {
  const { type } = req.query;

  if (!type) {
    return res.status(400).json({ error: "Report type is required" });
  }

  try {
    const results = await Investigation.findAll({
      raw: true,
    });

    const response = {};

    if (type === "blood") {
      const bloodCounts = {
        hemoglobin: { Low: 0, Normal: 0, High: 0 },
        platelets: { Low: 0, Normal: 0, High: 0 },
        whiteCells: { Low: 0, Normal: 0, High: 0 },
      };

      results.forEach((row) => {
        if (row.fbc_hb < 12) bloodCounts.hemoglobin.Low++;
        else if (row.fbc_hb <= 16) bloodCounts.hemoglobin.Normal++;
        else bloodCounts.hemoglobin.High++;

        if (row.fbc_pt < 150) bloodCounts.platelets.Low++;
        else if (row.fbc_pt <= 450) bloodCounts.platelets.Normal++;
        else bloodCounts.platelets.High++;

        if (row.fbc_wbc < 4) bloodCounts.whiteCells.Low++;
        else if (row.fbc_wbc <= 11) bloodCounts.whiteCells.Normal++;
        else bloodCounts.whiteCells.High++;
      });

      response.blood = {
        hemoglobin: Object.keys(bloodCounts.hemoglobin).map((key) => ({
          name: key,
          value: bloodCounts.hemoglobin[key],
        })),
        platelets: Object.keys(bloodCounts.platelets).map((key) => ({
          name: key,
          value: bloodCounts.platelets[key],
        })),
        whiteCells: Object.keys(bloodCounts.whiteCells).map((key) => ({
          name: key,
          value: bloodCounts.whiteCells[key],
        })),
      };
    } else if (type === "urine") {
      const urineCounts = {
        whiteCells_ur: { Low: 0, Normal: 0, High: 0 },
        redCells: { Low: 0, Normal: 0, High: 0 },
      };

      results.forEach((row) => {
        if (row.ufr_wc < 5) urineCounts.whiteCells_ur.Low++;
        else if (row.ufr_wc <= 10) urineCounts.whiteCells_ur.Normal++;
        else urineCounts.whiteCells_ur.High++;

        if (row.ufr_rc < 5) urineCounts.redCells.Low++;
        else if (row.ufr_rc <= 10) urineCounts.redCells.Normal++;
        else urineCounts.redCells.High++;
      });

      response.urine = {
        whiteCells_ur: Object.keys(urineCounts.whiteCells_ur).map((key) => ({
          name: key,
          value: urineCounts.whiteCells_ur[key],
        })),
        redCells: Object.keys(urineCounts.redCells).map((key) => ({
          name: key,
          value: urineCounts.redCells[key],
        })),
      };
    }

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching report analysis" });
  }
};

// Scan Data API
exports.getScanData = async (req, res) => {

  try {
    const result = await Investigation.findAll({
      attributes: [
        [Sequelize.fn('SUM', Sequelize.literal("CASE WHEN scan_ct != '' THEN 1 ELSE 0 END")), 'CT'],
        [Sequelize.fn('SUM', Sequelize.literal("CASE WHEN scan_mri != '' THEN 1 ELSE 0 END")), 'MRI'],
        [Sequelize.fn('SUM', Sequelize.literal("CASE WHEN uss_tas != '' THEN 1 ELSE 0 END")), 'TAS'],
        [Sequelize.fn('SUM', Sequelize.literal("CASE WHEN uss_tus != '' THEN 1 ELSE 0 END")), 'TUS'],
      ],
      raw: true,
    });

    res.json(result[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching scan data" });
  }
};

// const { Treatment } = require('./models');  // Import your Sequelize models

exports.getComplaintStats = async (req, res) => {
    console.log("hello")
    try {
        // Fetch all complaints from the 'treatment' table using Sequelize
        const treatments = await Treatment.findAll({
            attributes: ['complaints'],  // Only fetch the 'complaints' column
        });

        // Complaint categories
        const complaintCategories = [
            "Vaginal Bleeding",
            "Dribbling",
            "Subfertility",
            "Vaginal Discharge",
            "Abdominal Pain",
            "Back Pain",
            "Urinary Incontinence",
            "Blood Sugar Series"
        ];

        // Initialize counts
        const complaintCounts = complaintCategories.reduce((acc, category) => {
            acc[category] = 0;
            return acc;
        }, {});

        // Process complaints data
        treatments.forEach(treatment => {
            const complaints = treatment.complaints.split(',').map(c => c.trim());
            complaints.forEach(complaint => {
                if (complaintCounts.hasOwnProperty(complaint)) {
                    complaintCounts[complaint]++;
                }
            });
        });

        // Format data for frontend
        const formattedData = Object.keys(complaintCounts).map(category => ({
            name: category,
            value: complaintCounts[category],
        }));

        // Send the result as JSON
        res.json(formattedData);
    } catch (err) {
        // Handle any errors during the query or processing
        res.status(500).json({ error: 'Error retrieving complaints data' });
    }
}