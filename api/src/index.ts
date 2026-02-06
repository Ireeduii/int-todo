


// import { Hono } from 'hono';
// import { cors } from 'hono/cors';


// type Bindings = {
//   DB: D1Database;
// };

// const app = new Hono<{ Bindings: Bindings }>();

// app.use('/api/*', cors());

// app.get('/api/tasks', async (c) => {
//   try {
//     const { results } = await c.env.DB.prepare("SELECT * FROM tasks").all();
//     return c.json(results);
//   } catch (e) {
//     return c.json({ error: "DB error" }, 500);
//   }
// });

// app.post('/api/tasks', async (c) => {
//   const { text } = await c.req.json<{ text: string }>();
  
//   if (!text) {
//     return c.json({ error: "Empty text"}, 400);
//   }

//   await c.env.DB.prepare("INSERT INTO tasks (text, completed) VALUES (?, 0)")
//     .bind(text)
//     .run();
    
//   return c.json({ message: "Success" }, 200);
// });


// app.put('/api/tasks/:id', async (c) => {
//   const id = c.req.param('id');
//   const { completed } = await c.req.json<{ completed: boolean }>();
  
//   await c.env.DB.prepare("UPDATE tasks SET completed = ? WHERE id = ?")
//     .bind(completed ? 1 : 0, id)
//     .run();
    
//   return c.json({ message: "Updated" });
// });


// app.delete('/api/tasks/:id', async (c) => {
//   const id = c.req.param('id');
//   await c.env.DB.prepare("DELETE FROM tasks WHERE id = ?").bind(id).run();
//   return c.json({ message: "Deleted" });
// });

// export default app;


// import { Hono } from "hono";
// import {graphqlServer} from "@hono/graphql-server"
// import {buildSchema, graphql} from "graphql"
// import { cors } from "hono/cors";


// const app = new Hono <{Bindings: {DB: D1Database}}>()

// app.use('*', cors())

// const schema = buildSchema(`
// 	type Task {
// 	  id: Int
// 	  text: String
// 	completed: Boolean
// 	}
	
// 	type Query {
// 	  tasks: [Task]
// 	}
// 	 type Mutation {
// 	   addTask(text: String!): Task
// 	   deleteTask(id: Int!): String
// 	 }  
// `)

// const rootResolver = (c:any) => ({
// 	tasks: async () => {
// 		const {results} = await c.env.DB.prepare("SELECT * FROM tasks").all()
// 		return results;
// 	},
// 	addTask: async ({text} : {text: string}) => {
// 		const result = await c.env.DB.prepare("INSERT INTO tasks (text) VALUES (?) RETURNING *")
// 		.bind(text)
// 		.first()
// 		return result
// 	},
// 	deleteTask: async ({ id }: { id: number }) => {
//     await c.env.DB.prepare("DELETE FROM tasks WHERE id = ?").bind(id).run();
//     return "Deleted successfully";
//   }
// })


// app.all('/graphql', (c) => 
//   graphqlServer({
// 	rootValue: rootResolver(c),
//     schema,
//     pretty: true,
//     graphiql: true,
//   })(c, async () => {}) 
// )

    
// export default app


import { Hono } from 'hono'
import { graphqlServer } from '@hono/graphql-server'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { cors } from 'hono/cors'

const app = new Hono<{ Bindings: { DB: D1Database } }>()

app.use('*', cors())

const typeDefs = `
  type Task {
    id: Int
    text: String
    completed: Boolean
  }

  type Query {
    tasks: [Task]
  }

  type Mutation {
    addTask(text: String!): Task
    deleteTask(id: Int!): String
	toggleTask(id: Int!) : Task
  }
`


const resolvers = {
  Query: {
    tasks: async (_: any, __: any, c: any) => {
      const { results } = await c.env.DB.prepare("SELECT * FROM tasks").all();
      return results;
    },
  },
  Mutation: {
    addTask: async (_: any, { text }: { text: string }, c: any) => {
      const result = await c.env.DB.prepare("INSERT INTO tasks (text) VALUES (?) RETURNING *")
        .bind(text)
        .first();
      return result;
    },
    deleteTask: async (_: any, { id }: { id: number }, c: any) => {
      await c.env.DB.prepare("DELETE FROM tasks WHERE id = ?").bind(id).run();
      return "Deleted successfully";
    },
	toggleTask: async(_: any, { id }: {id: number}, c: any) => {
		const result = await c.env.DB.prepare(
			"UPDATE tasks SET completed = 1 - completed WHERE id = ? RETURNING * "
		).bind(id).first()
		
	}
	
  },
}

const schema = makeExecutableSchema({ typeDefs, resolvers })


app.all('/graphql', (c) => 
  graphqlServer({
    schema,
    pretty: true,
    // graphiql: true,
  })(c, async () => {}) 
)

export default app