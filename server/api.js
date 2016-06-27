const express = require('express');
const router = express.Router();
module.exports = baseDir => {
  router.get('/detail', (req, res) => {
    const id = req.query.id;
    const sres = {
      total: id.length,
      users: [],
    };
    for (let i = 0; i < 20; i++) {
      sres.users.push({
        avatar: 'assets/img/img_user_30x30.png',
        name: `zhuhui322${i}`,
        email: '#',
        pos: '武汉',
        status: (Math.random() * 1).toFixed(0), /* 1- online ,0 - offline*/
        range: Array.from({ length: Math.random() * 7 + 1 }, (d, i2) => i2),
      });
    }
    res.send(JSON.stringify(sres));
  });
  return router;
};
