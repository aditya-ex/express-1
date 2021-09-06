const deleteAddress = async (req, res) => {
  try {
    let addressToDelete = [];
    const token = await Token.findOne({ token: req.headers.access_token });
    const address = await Address.find({ user_id: token.userId });
    for (let i = 0; i < address.length; i++) {
      let id = address[i]._id.toString();
      addressToDelete.push(id);
    }
    let deletedAddress = address.deleteMany({ _id: { $in: addressToDelete } });
    res.send("address deleted");
  } catch (err) {
    res.send("an error occured");
    console.log(err);
  }
};
module.exports = { deleteAddress };
