async function checkGrammar() {
  const inputText = document.getElementById('inputText').value;
  const correctedDiv = document.getElementById('corrected');
  const issuesList = document.getElementById('issues');
  const meaningsList = document.getElementById('meanings');
  const loader = document.getElementById('loader');

  // Reset output
  correctedDiv.innerText = '';
  issuesList.innerHTML = '';
  meaningsList.innerHTML = '';
  loader.style.display = 'block';

  try {
    // Use full URL to Flask backend
    const response = await fetch('http://127.0.0.1:5000/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: inputText })
    });

    const data = await response.json();

    // 2. Show grammar results
    correctedDiv.innerText = data.corrected || 'No correction found.';

    if (data.issues && data.issues.length > 0) {
      data.issues.forEach(issue => {
        const li = document.createElement('li');
        li.textContent = issue;
        issuesList.appendChild(li);
      });
    } else {
      issuesList.innerHTML = '<li>No grammar issues detected.</li>';
    }

    // 3. Show dictionary meanings
    if (data.meanings && data.meanings.length > 0) {
      data.meanings.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<b>${item.word}</b>: ${item.definition}`;
        meaningsList.appendChild(li);
      });
    } else {
      meaningsList.innerHTML = '<li>No definitions found.</li>';
    }

  } catch (err) {
    correctedDiv.innerText = 'Error: Could not get grammar results.';
    console.error('Fetch error:', err);
  } finally {
    loader.style.display = 'none';
  }
}
