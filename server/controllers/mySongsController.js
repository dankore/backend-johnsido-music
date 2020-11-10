const MySongs = require('../models/mySongsModel');

exports.apiFetchMySongs = async (req, res) => {
  try {
    const songs = await MySongs.fetch('5f34ce62026d250eb88342a3');
    res.json(songs);
  } catch (error) {
    res.json(error);
  }
};
