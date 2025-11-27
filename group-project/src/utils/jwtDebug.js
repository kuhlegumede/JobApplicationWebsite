
export function decodeJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT format');
      return null;
    }

    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

export function logJWTClaims() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.log('No JWT token found in localStorage');
    return null;
  }

  const decoded = decodeJWT(token);
  
  if (!decoded) {
    return null;
  }

  console.group('JWT Token Claims');
  console.log('Full payload:', decoded);
  console.log('---');
  console.log('UserId:', decoded.UserId);
  console.log('NameIdentifier:', decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']);
  console.log('Email:', decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']);
  console.log('Role:', decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']);
  console.log('EmployerId:', decoded.EmployerId);
  console.log('JobSeekerId:', decoded.JobSeekerId);
  console.log('AdminId:', decoded.AdminId);
  console.log('---');
  console.log('Issued at:', new Date(decoded.iat * 1000).toLocaleString());
  console.log('Expires at:', new Date(decoded.exp * 1000).toLocaleString());
  console.log('Is expired:', Date.now() > decoded.exp * 1000);
  console.groupEnd();

  return decoded;
}

// Auto-log on import in development
if (import.meta.env.DEV) {
  console.log(' JWT Debug utility loaded');
}
