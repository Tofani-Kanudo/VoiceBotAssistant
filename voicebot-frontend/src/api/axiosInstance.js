export const sendMessage = async (message) => {
  const response = await fetch('http://localhost:8000/send_message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message })
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  return response.json();
};
