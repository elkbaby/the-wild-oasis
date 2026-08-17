function escapeCell(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

export function downloadBookingsCsv(bookings, fileName) {
  const headers = [
    "Booking ID",
    "Cabin",
    "Guest",
    "Email",
    "Check-in",
    "Check-out",
    "Nights",
    "Guests",
    "Status",
    "Paid",
    "Revenue",
  ];

  const rows = bookings.map((booking) => [
    booking.id,
    booking.cabins?.name,
    booking.guests?.fullName,
    booking.guests?.email,
    booking.startDate,
    booking.endDate,
    booking.numNights,
    booking.numGuests,
    booking.status,
    booking.isPaid ? "Yes" : "No",
    booking.totalPrice,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCell).join(","))
    .join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
