import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

// 在真实的应用中，这里的数据会来自数据库
// 为了演示，我们暂时将数据存储在内存中
let messages = [
  { id: 1, text: "Hello Remix!", author: "Alice", timestamp: new Date() },
  { id: 2, text: "This is pretty cool.", author: "Bob", timestamp: new Date() },
];

// Loader: 当页面加载时，Remix会调用这个函数来获取数据
export async function loader({ request }: LoaderFunctionArgs) {
  // 我们直接返回内存中的留言数组
  // json() 函数会将数据序列化为JSON格式
  return json({ messages });
}

// Action: 当有表单提交到这个路由时，Remix会调用这个函数
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const author = formData.get("author") as string;
  const text = formData.get("text") as string;

  // 创建一个新的留言对象
  const newMessage = {
    id: messages.length + 1,
    text,
    author,
    timestamp: new Date(),
  };

  // 将新留言添加到数组中
  messages.push(newMessage);

  // Action函数通常在成功后返回null或者一个重定向
  // Remix看到action成功后，会自动重新调用loader来获取最新数据
  return null;
}

// 页面组件
export default function MessagesRoute() {
  const { messages } = useLoaderData<typeof loader>();

  return (
    <div className="p-8 font-sans">
      <h1 className="text-3xl font-bold mb-6">留言板</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">所有留言</h2>
        <ul className="space-y-4">
          {messages.map((msg) => (
            <li key={msg.id} className="p-4 bg-gray-100 rounded-lg shadow">
              <p className="text-gray-800">{msg.text}</p>
              <div className="text-right text-sm text-gray-500 mt-2">
                <span>- {msg.author}</span>
                <span className="ml-4">
                  {new Date(msg.timestamp).toLocaleString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">发表新留言</h2>
        {/* Remix的Form组件会自动将表单提交给当前路由的action */}
        <Form method="post" className="space-y-4">
          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700">你的名字</label>
            <input type="text" id="author" name="author" required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label htmlFor="text" className="block text-sm font-medium text-gray-700">留言内容</label>
            <textarea id="text" name="text" rows={4} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
          </div>
          <div>
            <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              提交留言
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}