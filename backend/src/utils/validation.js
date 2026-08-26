import mongoose from 'mongoose';

export const isValidObjectId = (value) => mongoose.isValidObjectId(value);

export const parseCoordinates = (lng, lat) => {
  if (lng === null || lng === undefined || lat === null || lat === undefined || lng === '' || lat === '') {
    return null;
  }
  const longitude = Number(lng);
  const latitude = Number(lat);

  if (!Number.isFinite(longitude) || !Number.isFinite(latitude) || longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
    return null;
  }

  return { lng: longitude, lat: latitude };
};

export const isSafeText = (value, { min = 1, max = 1000 } = {}) => (
  typeof value === 'string' && value.trim().length >= min && value.trim().length <= max
);

export const normalizeEmail = (email) => (
  typeof email === 'string' ? email.trim().toLowerCase() : ''
);

export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
