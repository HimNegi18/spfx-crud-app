import * as React from 'react';
import { useEffect, useState } from 'react';
import { SPHttpClient } from '@microsoft/sp-http';
import { IMyListComponentProps } from './IMyListComponentProps';
import { IListItem } from './IListItem';

const MyListComponent: React.FC<IMyListComponentProps> = (props) => {

  const [items, setItems] = useState<IListItem[]>([]);
  const [title, setTitle] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [fname, setFname] = useState<string>('');
  const [lname, setLname] = useState<string>('');
  const [editId, setEditId] = useState<number | null>(null);

  const siteUrl = props.context.pageContext.web.absoluteUrl;

  // ✅ GET REQUEST DIGEST (REQUIRED FOR POST, UPDATE)
  const getRequestDigest = async (): Promise<string> => {
    const res = await props.context.spHttpClient.post(
      `${siteUrl}/_api/contextinfo`,
      SPHttpClient.configurations.v1,
      {}
    );
    const data = await res.json();
    return data.FormDigestValue;
  };

  // ✅ READ ITEMS
  const fetchItems = async (): Promise<void> => {
    const endpoint =
      `${siteUrl}/_api/web/lists/getbytitle('${props.listName}')/items?$select=Id,Title,FirstName,LastName,Age`;

    const response = await props.context.spHttpClient.get(
      endpoint,
      SPHttpClient.configurations.v1
    );

    const data = await response.json();
    setItems(data.value);
  };

  useEffect(() => {
    fetchItems().catch(error => console.error(error));
  }, []);

  // ✅ CLEAR FORM
  const clearForm = (): void => {
    setEditId(null);
    setTitle('');
    setFname('');
    setLname('');
    setAge('');
  };

  // ✅ CREATE ITEM
  const addItem = async (): Promise<void> => {

    const digest = await getRequestDigest();

    const endpoint =
      `${siteUrl}/_api/web/lists/getbytitle('${props.listName}')/items`;

    const body = JSON.stringify({
      Title: title,
      FirstName: fname,
      LastName: lname,
      Age: age
    });

    await props.context.spHttpClient.post(
      endpoint,
      SPHttpClient.configurations.v1,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-RequestDigest': digest
        },
        body: body
      }
    );

    clearForm();
    await fetchItems();
  };

  // ✅ LOAD ITEM FOR EDIT
  const startEdit = (item: IListItem): void => {
    setEditId(item.Id);
    setTitle(item.Title);
    setFname(item.FirstName);
    setLname(item.LastName);
    setAge(item.Age);
  };

  // ✅ UPDATE ITEM
  const updateItem = async (): Promise<void> => {

    if (!editId) return;

    const digest = await getRequestDigest();

    const endpoint =
      `${siteUrl}/_api/web/lists/getbytitle('${props.listName}')/items(${editId})`;

    const body = JSON.stringify({
      Title: title,
      FirstName: fname,
      LastName: lname,
      Age: age
    });

    await props.context.spHttpClient.post(
      endpoint,
      SPHttpClient.configurations.v1,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'IF-MATCH': '*',
          'X-HTTP-Method': 'MERGE',
          'X-RequestDigest': digest
        },
        body: body
      }
    );

    clearForm();
    await fetchItems();
  };

  // ✅ DELETE ITEM
  const deleteItem = async (id: number): Promise<void> => {

    const digest = await getRequestDigest();

    const endpoint =
      `${siteUrl}/_api/web/lists/getbytitle('${props.listName}')/items(${id})`;

    await props.context.spHttpClient.post(
      endpoint,
      SPHttpClient.configurations.v1,
      {
        headers: {
          'Accept': 'application/json',
          'IF-MATCH': '*',
          'X-HTTP-Method': 'DELETE',
          'X-RequestDigest': digest
        }
      }
    );

    await fetchItems();
  };

  // ✅ UI
  return (
    <div>

      <h3>CRUD Form</h3>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        type="text"
        placeholder="First Name"
        value={fname}
        onChange={(e) => setFname(e.target.value)}
      />

      <input
        type="text"
        placeholder="Last Name"
        value={lname}
        onChange={(e) => setLname(e.target.value)}
      />

      <input
        type="text"
        placeholder="Age"
        value={age}
        onChange={(e) => setAge(e.target.value)}
      />

      <button onClick={editId ? updateItem : addItem}>
        {editId ? 'Update' : 'Add'}
      </button>

      <hr />

      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid black', padding: '8px' }}>Id</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Title</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>First Name</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Last Name</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Age</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {items.map(item => (
            <tr key={item.Id}>
              <td style={{ border: '1px solid black', padding: '8px' }}>{item.Id}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{item.Title}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{item.FirstName}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{item.LastName}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{item.Age}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>
                <button onClick={() => startEdit(item)}>Edit</button>
                <button onClick={() => deleteItem(item.Id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
};

export default MyListComponent;
