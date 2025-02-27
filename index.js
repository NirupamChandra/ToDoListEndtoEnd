import express from "express";
import bodyParser from "body-parser";
import pg from 'pg';

const app = express();
const port = 3000;

const db = new pg.Client({
  user : 'postgres',
  host : 'localhost',
  database : 'permalist',
  password : '5428',
  port : '5432'
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

async function getAllEntries() {

  let result = await db.query('select * from items order by id DESC;');
  result = result.rows;

  return result;
}

app.get("/", async(req, res) => {

  items = await getAllEntries();
  res.render("index.ejs", {
	listTitle: "Today",
	listItems: items,
  });
});

app.post("/add", async(req, res) => {
  
  const item = req.body.newItem;
  const temp = req.body.list;

  try{
	await db.query('insert into items(title) values($1);', [item]);
	res.redirect('/');
  }catch(err){
	console.log(err);
  }
});

app.post("/edit", async(req, res) => {

	let reqId = req.body.updatedItemId;
	let updatedTitle = req.body.updatedItemTitle;

	try{
		db.query('update items set title = $1 where id = $2;', [updatedTitle, reqId]);
		res.redirect('/');
	}catch(err){
		console.log(err);
	}
});

app.post("/delete", async(req, res) => {

	let toDelId = req.body.deleteItemId;
	try{
		await db.query('delete from items where id = $1;',[toDelId]);
		res.redirect('/');
	}catch(err){
		res.status(500).json({error : 'INternal error!'});
	}
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
