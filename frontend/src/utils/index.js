import axios from "axios"; 
 
const getApiUrl = () =
  if (process.env.REACT_APP_API_URL) { 
    return process.env.REACT_APP_API_URL; 
  } 
    return "http://localhost:10000"; 
  } 
  return "https://mangazone-api.onrender.com"; 
}; 
 
export const API_BASE_URL = getApiUrl(); 
export const API_URL = "${API_BASE_URL}/api"; 
 
export const api = axios.create({ 
  baseURL: API_URL, 
  timeout: 30000, 
  headers: { 
    'Content-Type': 'application/json', 
    'Accept': 'application/json' 
  } 
}); 
 
export const ImageWithFallback = ({ src, alt, className, ...props }) =
  const [error, setError] = React.useState(false); 
  const fallbackSrc = "https://placehold.co/400x600/1e1e1e/FFF?text=No+Cover"; 
  return ( 
    <img 
      className={className} 
      onError={() =
      loading="lazy" 
      {...props} 
    /> 
  ); 
}; 
 
export const timeAgo = (date) =
  if (!date) return ""; 
  try { 
    const now = new Date(); 
    const past = new Date(date); 
    const seconds = Math.floor((now - past) / 1000); 
    const minutes = Math.floor(seconds / 60); 
    const hours = Math.floor(minutes / 60); 
    const days = Math.floor(hours / 24); 
    const months = Math.floor(days / 30); 
    return "${Math.floor(months / 12)} ?????????"; 
  } catch (e) { 
    return ""; 
  } 
}; 
