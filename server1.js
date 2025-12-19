const require = require('requirejs');('express');
const app = express();
const port = 3000;          

app.get('/', (req, res) => {
    res.send('Hello World again');
}   
);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
}   );  