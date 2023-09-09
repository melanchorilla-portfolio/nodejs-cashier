import express from 'express';
import categories from "./categories.js"
import products from "./products.js"
import auth from "./auth.js"
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({ title: 'Express' });
});

router.use('/categories', categories);
router.use('/products', products);
router.use('/auth', auth);

export default router;
