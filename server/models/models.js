const sequelize = require("../db");
const { DataTypes } = require("sequelize");

const User = sequelize.define("user", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, unique: true },
  password: { type: DataTypes.STRING },
  role: { type: DataTypes.STRING, defaultValue: "USER" },
});

const Patient = sequelize.define("patient", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  Surname: { type: DataTypes.STRING, defaultValue: null },
  Name: { type: DataTypes.STRING, defaultValue: null },
  LastName: { type: DataTypes.STRING, defaultValue: null },
  Birthday: { type: DataTypes.STRING, defaultValue: null },
  PlaceOfLiving: { type: DataTypes.STRING, defaultValue: null },
  Phone: { type: DataTypes.STRING, defaultValue: null },
});

const Doctor = sequelize.define("doctor", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  location: { type: DataTypes.STRING, defaultValue: null },
  date_table: { type: DataTypes.TEXT, defaultValue: null },
  entry: { type: DataTypes.STRING, defaultValue: null },
  Surname: { type: DataTypes.STRING, defaultValue: null },
  Name: { type: DataTypes.STRING, defaultValue: null },
  LastName: { type: DataTypes.STRING, defaultValue: null },
  description: { type: DataTypes.TEXT, defaultValue: null },
  photo: { type: DataTypes.STRING, defaultValue: null },
  certificates: { type: DataTypes.STRING, defaultValue: null },
  experience: { type: DataTypes.STRING, defaultValue: null },
});

const Entry_table = sequelize.define("entry_table", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  date: { type: DataTypes.STRING },
  time: { type: DataTypes.STRING },
});

const Specialization = sequelize.define("specialization", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  specialization: { type: DataTypes.STRING },
});

const Review = sequelize.define("review", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  text_review: { type: DataTypes.STRING },
  stars: { type: DataTypes.INTEGER },
});

const VerificationCode = sequelize.define("VerificationCode", {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  verificationCode: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  expirationDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

User.hasOne(Patient);
Patient.belongsTo(User);
User.hasOne(Doctor);
Doctor.belongsTo(User);

Patient.hasMany(Review);
Review.belongsTo(Patient);
Patient.hasMany(Entry_table);
Entry_table.belongsTo(Patient);

Doctor.hasMany(Review);
Review.belongsTo(Doctor);

Specialization.hasMany(Doctor);
Doctor.belongsTo(Specialization);

Doctor.hasMany(Entry_table);
Entry_table.belongsTo(Doctor);

Entry_table.hasOne(Review);
Review.belongsTo(Entry_table);

module.exports = {
  User,
  Patient,
  Doctor,
  Entry_table,
  Review,
  Specialization,
  VerificationCode,
};
