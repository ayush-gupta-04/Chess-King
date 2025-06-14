import { getUser } from "./action/getUserInfo";

export default async function Home() {
  const user = await  getUser();
  return (
    <div>
      {user?.id}
      {user?.name}
    </div>
  );
}
