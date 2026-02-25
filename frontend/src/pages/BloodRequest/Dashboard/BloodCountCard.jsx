import './BloodrequestDashboard.css';

const BloodCountCard = ({ bloodType, count, unit }) => {
  return (
    <div className="card">
      <h3 className="highlight">
        Total <span className="blood-type">{bloodType}</span> Count
      </h3>
      <div className="value">
        {count} <span className="count-unit">{unit}</span>
      </div>
    </div>
  );
};

export default BloodCountCard;