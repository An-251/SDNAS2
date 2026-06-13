export const resolveFormMethod = (req) => {
  const fromBody = req.body?._method;
  const fromQuery = req.query?._method;
  const raw = (fromBody ?? fromQuery ?? '').toString().trim();

  return raw ? raw.toUpperCase() : null;
};
