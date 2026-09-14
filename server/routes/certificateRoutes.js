const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const {
  listCertificates,
  createCertificate,
  updateCertificate,
  deleteCertificate,
} = require('../controllers/certificateController');

const router = express.Router();

router.use(requireAuth);

router.get('/', listCertificates);
router.post(
  '/',
  [
    body('name').trim().notEmpty(),
    body('issuingOrganization').trim().notEmpty(),
    body('issueDate').notEmpty(),
  ],
  validate,
  createCertificate
);
router.put('/:id', updateCertificate);
router.delete('/:id', deleteCertificate);

module.exports = router;
