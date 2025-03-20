import { useState } from "react";
import { showNotification } from "../../utils";
import './style.css';

const Profile = () => {
  const [userInfo, setUserInfo] = useState({
    name: 'admin',
    organization: 't1',
  });

  const [mode, setMode] = useState('read');

  const [userInput, setUserInput] = useState({
    name: '',
    organization: '',
  });

  const handleChange = (e) => {
    setUserInput({
      ...userInput,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="profile">
      {mode === 'read' ? (
        <>
          <p className="profile_name">Имя пользователя: <b>{userInfo.name}</b></p> 
          <p className="profile_organization">Название организации: <b>{userInfo.organization}</b></p>
          <button type="button" onClick={() => setMode('edit')}>Редактировать</button>
        </>
      ) : (
        <>
          <input
            type="text"
            placeholder="Имя пользователя"
            name="name"
            value={userInput.name}
            onChange={(e) => handleChange(e)}
          />
          <input
            type="text"
            placeholder="Название организации"
            name="organization"
            value={userInput.organization}
            onChange={(e) => handleChange(e)}
          />
          <button type="button" onClick={() => {
            setUserInfo(userInput);
            setMode('read');
            showNotification('Успешно', 'Данные успешно обновлены', '/icons/check.svg');
          }}>Сохранить</button>
        </>
      )}
    </div>
  );
};

export default Profile;
