import { Hono } from 'hono';
import { graphqlServer } from '@hono/graphql-server';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { cors } from 'hono/cors';

const app = new Hono<{ Bindings: { DB: D1Database } }>();

app.use('*', cors());

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
`;

const resolvers = {
	Query: {
		tasks: async (_: any, __: any, c: any) => {
			const { results } = await c.env.DB.prepare('SELECT * FROM tasks').all();
			return results;
		},
	},
	Mutation: {
		addTask: async (_: any, { text }: { text: string }, c: any) => {
			const result = await c.env.DB.prepare('INSERT INTO tasks (text) VALUES (?) RETURNING *').bind(text).first();
			return result;
		},
		deleteTask: async (_: any, { id }: { id: number }, c: any) => {
			await c.env.DB.prepare('DELETE FROM tasks WHERE id = ?').bind(id).run();
			return 'Deleted successfully';
		},
		toggleTask: async (_: any, { id }: { id: number }, c: any) => {
			const result = await c.env.DB.prepare('UPDATE tasks SET completed = 1 - completed WHERE id = ? RETURNING * ').bind(id).first();
		},
	},
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

app.all('/graphql', (c) =>
	graphqlServer({
		schema,
		pretty: true,
		// graphiql: true,
	})(c, async () => {}),
);

export default app;
