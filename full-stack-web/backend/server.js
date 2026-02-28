import express from 'express';

const app = express();

app.use(express.static('dist'));

// app.get('/', (req, res) => {
//   res.send('Server is ready!');
// });

app.get('/api/jokes', (req, res) => {
    const jokes = [
        { 
            id: 1, 
            title: "Joke 1", 
            content: "Why don't scientists trust atoms?" 
        },
        { 
            id: 2, 
            title: "Joke 2", 
            content: "Because they make up everything!" 
        },
        { 
            id: 3, 
            title: "Joke 3", 
            content: "Why did the scarecrow win an award?" 
        },
        { 
            id: 4, 
            title: "Joke 4", 
            content: "Because he was outstanding in his field!" 
        },
    ];
    res.json(jokes);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});