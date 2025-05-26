import { DataTypes, Model } from 'sequelize';
import sequelize from './index.js';

class Kreis extends Model {}

Kreis.init({
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  order: { type: DataTypes.INTEGER },
}, {
  sequelize,
  modelName: 'Kreis',
  timestamps: true,
});

export default Kreis; 