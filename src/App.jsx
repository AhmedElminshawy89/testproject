import { useState, useEffect } from "react";
import {
  useFetchDataQuery,
  useAddDataMutation,
  useDelDataMutation,
} from "./app/feature/apiSlice";
import { v4 as uuidv4 } from "uuid";

function App() {
  const [user, setUser] = useState({
    name: "",
    email: "",
  });

  const { data, error, isLoading } = useFetchDataQuery();
  const [addDataMutation] = useAddDataMutation();
  const [delDataMutation] = useDelDataMutation();
  const [dataa, setDataa] = useState({ test: [] });
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const id = uuidv4();
      const userWithId = { ...user, id };
      if (navigator.onLine) {
        await addDataMutation(userWithId);
      } else {
        const offlineData =
          JSON.parse(localStorage.getItem("offlineData")) || [];
        localStorage.setItem(
          "offlineData",
          JSON.stringify([...offlineData, userWithId])
        );
        setDataa((prevData) => ({
          ...prevData,
          test: [...prevData.test, userWithId],
        }));
      }
      setUser({ name: "", email: "" });
    } catch (error) {
      console.error("حدث خطأ أثناء إرسال البيانات:", error);
    }
  };

  const syncOfflineData = async () => {
    try {
      const offlineData = JSON.parse(localStorage.getItem("offlineData")) || [];
      for (const userData of offlineData) {
        await addDataMutation(userData);
      }
      localStorage.removeItem("offlineData");
      setDataa({ test: [] });
    } catch (error) {
      console.error("Error synchronizing offline data:", error);
    }
  };

  useEffect(() => {
    window.addEventListener("online", syncOfflineData);
    return () => {
      window.removeEventListener("online", syncOfflineData);
    };
  }, []);

  const DeleteItem = async (id) => {
    try {
      if (navigator.onLine) {
        await delDataMutation(id);
      } else {
        let items = JSON.parse(localStorage.getItem("offlineData")) || [];
        const updatedItems = items.filter((item) => item.id !== id);
        localStorage.setItem("offlineData", JSON.stringify(updatedItems));
        setDataa((prevData) => ({
          ...prevData,
          test: updatedItems,
        }));
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  useEffect(() => {
    if (data) {
      const filtered = data.test.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [data, search]);

  return (
    <>
      <form className="form" onSubmit={onSubmit}>
        <input
          className="inpt"
          value={user.name}
          name="name"
          onChange={onChangeHandler}
          type="text"
          placeholder="Your Name"
        />
        <input
          className="inpt"
          value={user.email}
          name="email"
          onChange={onChangeHandler}
          type="email"
          placeholder="Your email"
        />
        <button type="submit">Save</button>
      </form>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      <input
        type="text"
        placeholder="Search"
        onChange={(e) => setSearch(e.target.value)}
        className="inpt"
      />
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {(filteredData || data.test).map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{item.email}</td>
              <td style={{ display: "flex", gap: "4px" }}>
                <button onClick={() => DeleteItem(item.id)}>حذف</button>
                <button>تعديل</button>
              </td>
            </tr>
          ))}
          {!navigator.onLine && dataa && dataa.test.length > 0 && (
            dataa.test.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.email}</td>
                <td>
                  <button onClick={() => DeleteItem(item.id)}>حذف</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </>
  );
}

export default App;
