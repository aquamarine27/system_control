package models

import "sync"

type Project struct {
	ID    uint   `json:"id"`
	Title string `json:"title"`
}

// User struct
type User struct {
	ID       uint      `json:"id"`
	Login    string    `json:"login"`
	Password string    `json:"password"`
	Role     uint      `json:"role"` // 1-user, 2-manager, 3-admin
	Projects []Project `json:"projects"`
}

// In-memory storage
var (
	users          = make(map[uint]User)
	userID    uint = 1
	usersLock sync.Mutex
)

// AddUser (simulate DB create)
func AddUser(user User) {
	usersLock.Lock()
	defer usersLock.Unlock()
	user.ID = userID
	users[userID] = user
	userID++
}

// GetUserByLogin
func GetUserByLogin(login string) (User, bool) {
	usersLock.Lock()
	defer usersLock.Unlock()
	for _, u := range users {
		if u.Login == login {
			return u, true
		}
	}
	return User{}, false
}

// GetUserByID
func GetUserByID(id uint) (User, bool) {
	usersLock.Lock()
	defer usersLock.Unlock()
	u, exists := users[id]
	return u, exists
}
