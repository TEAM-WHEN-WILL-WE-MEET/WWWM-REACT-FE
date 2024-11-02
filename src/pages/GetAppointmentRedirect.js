// GetAppointmentRedirect.js
import { Navigate, useLocation } from 'react-router-dom';

const GetAppointmentRedirect = () => {
  const location = useLocation();
  return <Navigate to={`/invite${location.search}`} replace />;
};

export default GetAppointmentRedirect;
