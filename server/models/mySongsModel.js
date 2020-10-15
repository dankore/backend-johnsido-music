const songsCollection = require('../../db').db().collection('songs');
const {ObjectID} = require('mongodb');

let MySongs = class mySongs {
  constructor(data) {
    this.data = data;
    this.errors = [];
  }
}

MySongs.reUseableQuery = (uniqueOperations) => {
  return new Promise(async(resolve, reject) => {
    try {
      const aggOperations = uniqueOperations.concat([
        {
          $lookup: {
            from: 'users',
            localField: 'songOwnerId',
            foreignField: '_id',
            as: 'authorDoc',
          },
        },
        {
          $project: {
            songTitle: 1,
            songPostedDate: 1,
            songUrl: 1,
            songCoverImage: 1,
            songAlbumTitle: 1,
            author: {$arrayElemAt: ['$authorDoc', 0]},
          }
        }
      ]);

      let songs = await songsCollection.aggregate(aggOperations).toArray();
      

      // CLEAN UP AUTHOR
      songs = songs.map(song => {
         song.author = {
            username: song.author.username,
            firstName: song.author.firstName,
            lastName: song.author.lastName,
            avatar: song.author.avatar,
            about: song.author.about,
          };

       return song;
      });

    resolve(songs);
    } catch(error){
      reject(error)
    }
  })
}

MySongs.fetch = (id) => {
  return new Promise(async(resolve, reject)=> {
    try {
     
      const songs = await MySongs.reUseableQuery(
        [{$match: { songOwnerId: new ObjectID(id)}}]
      );

      resolve({ status: 'Success', songs });
    } catch(error){
      reject(error);
    }
  })
}


module.exports = MySongs;