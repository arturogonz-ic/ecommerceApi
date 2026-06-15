import { Suggestion } from '../model/Suggestion.js';

export const createSuggestion = ({ userId, name, email, message }) =>
  Suggestion.create({ userId, name, email, message });

export const getSuggestions = () =>
  Suggestion.find().sort({ createdAt: -1 });

export const markSuggestionRead = (id) =>
  Suggestion.findByIdAndUpdate(id, { read: true }, { new: true });

export const deleteSuggestion = (id) =>
  Suggestion.findByIdAndDelete(id);
