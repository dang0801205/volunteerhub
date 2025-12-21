/**
 * @format
 * @param {Object} req
 * @param {String} room
 * @param {Object} data
 */

export const emitNotification = (req, room, data) => {
  if (req.io && room) {
    req.io.to(room).emit("NOTIFICATION", {
      ...data,
      time: new Date(),
      id: Date.now().toString,
    });
  }
};

export const emitToMultiple = (req, userIds, data) => {
  if (req.io && userIds && userIds.length > 0) {
    userIds.forEach((id) => {
      req.io.to(id.toString()).emit("NOTIFICATION", {
        ...data,
        id: `${Date.now()}-${id}`,
        time: new Date(),
      });
    });
  }
};
