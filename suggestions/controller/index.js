import { createSuggestionSchema } from '../validation/index.js';
import { createSuggestion, getSuggestions, markSuggestionRead, deleteSuggestion } from '../service/index.js';

export const submit = async (req, res, next) => {
  try {
    const { message } = createSuggestionSchema.parse(req.body);
    const suggestion = await createSuggestion({
      userId: req.user._id,
      name: req.user.name,
      email: req.user.email,
      message,
    });
    res.json({ success: true, data: { suggestion } });
  } catch (err) {
    next(err);
  }
};

export const list = async (req, res, next) => {
  try {
    const suggestions = await getSuggestions();
    res.json({ success: true, data: { suggestions } });
  } catch (err) {
    next(err);
  }
};

export const markRead = async (req, res, next) => {
  try {
    const suggestion = await markSuggestionRead(req.params.id);
    if (!suggestion) return res.json({ success: false, code: 404, message: 'Not found' });
    res.json({ success: true, data: { suggestion } });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    await deleteSuggestion(req.params.id);
    res.json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
