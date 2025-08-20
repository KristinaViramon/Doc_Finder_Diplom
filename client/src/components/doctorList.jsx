import React from 'react';
import DoctorTile from './doctorTile';
import '../styles/doctor-list.css'
const DoctorList = ({ doctors }) => {
  return (
    <div className="doctor-list">
      {doctors.map(doctor => (
        <DoctorTile key={doctor.id} doctor={doctor} />
      ))}
    </div>
  );
};

export default DoctorList;
