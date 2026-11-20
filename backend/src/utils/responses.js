export function paginated(res, items, page, limit, total) {
  res.json({
    success: true,
    data: items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  });
}

export function ok(res, data, message) {
  res.json({ success: true, ...(message && { message }), data });
}

