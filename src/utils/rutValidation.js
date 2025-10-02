// utils/rutValidation.js

// Función para validar RUT chileno
export const validateRut = (rut) => {
  if (!rut) return false;
  
  // Remover puntos y guión
  const cleanRut = rut.replace(/[.-]/g, '').toUpperCase();
  
  if (cleanRut.length < 2) return false;
  
  const body = cleanRut.slice(0, -1);
  const checkDigit = cleanRut.slice(-1);
  
  // Verificar que el cuerpo contenga solo números
  if (!/^\d+$/.test(body)) return false;
  
  // Calcular dígito verificador
  let sum = 0;
  let multiplier = 2;
  
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const expectedCheckDigit = 11 - (sum % 11);
  let calculatedCheckDigit = expectedCheckDigit === 11 ? '0' : expectedCheckDigit === 10 ? 'K' : expectedCheckDigit.toString();
  
  return checkDigit === calculatedCheckDigit;
};

// Función para formatear RUT
export const formatRut = (rut) => {
  if (!rut) return '';
  
  const cleanRut = rut.replace(/[.-]/g, '');
  if (cleanRut.length < 2) return cleanRut;
  
  const body = cleanRut.slice(0, -1);
  const checkDigit = cleanRut.slice(-1);
  
  // Agregar puntos cada 3 dígitos
  const formattedBody = body.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
  
  return `${formattedBody}-${checkDigit}`;
};

// Función para obtener los últimos 4 dígitos del RUT para contraseña
export const getLastFourDigits = (rut) => {
  if (!rut) return '';
  
  const cleanRut = rut.replace(/[.-]/g, '');
  const body = cleanRut.slice(0, -1); // Sin el dígito verificador
  
  // Retornar los últimos 4 dígitos del cuerpo del RUT
  return body.slice(-4).padStart(4, '0');
};