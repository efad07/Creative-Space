
import { HeaderConfig, MediaItem, User } from './types';

const DB_NAME = 'CreativeSpaceDB';
const DB_VERSION = 2;
const STORE_MEDIA = 'media';
const STORE_CONFIG = 'config';
const STORE_USERS = 'users';

// Seed data with Categories
const SEED_DATA: Partial<MediaItem>[] = [
  {
    id: 'seed-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    name: 'Mountain Landscape',
    title: 'Alpine Dreams',
    category: 'Photography',
    likes: 124,
    views: 1540,
    likedByUser: false,
    authorName: 'Sarah Jenkins',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    userId: 'sarah@example.com'
  },
  {
    id: 'seed-2',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    name: 'Student Life',
    title: 'Study Session',
    category: 'Lifestyle',
    likes: 89,
    views: 890,
    likedByUser: false,
    authorName: 'David Lee',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    userId: 'david@example.com'
  },
  {
    id: 'seed-3',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    name: 'Tech Setup',
    title: 'Workspace Goals',
    category: 'Tech',
    likes: 432,
    views: 5200,
    likedByUser: false,
    authorName: 'Alex Tech',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    userId: 'alex@example.com'
  },
    {
    id: 'seed-4',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    name: 'Abstract Art',
    title: 'Liquid Colors',
    category: 'Art',
    likes: 215,
    views: 3100,
    likedByUser: true,
    authorName: 'Creative Studio',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Studio',
    userId: 'studio@example.com'
  }
];

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_MEDIA)) {
        db.createObjectStore(STORE_MEDIA, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_CONFIG)) {
        db.createObjectStore(STORE_CONFIG, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORE_USERS)) {
        db.createObjectStore(STORE_USERS, { keyPath: 'email' });
      }
    };
  });
};

const seedDatabase = async (db: IDBDatabase) => {
  return new Promise<void>((resolve) => {
     const transaction = db.transaction([STORE_MEDIA], 'readwrite');
     const store = transaction.objectStore(STORE_MEDIA);
     
     // Check count
     const countRequest = store.count();
     countRequest.onsuccess = () => {
       if (countRequest.result === 0) {
         // Seed
         SEED_DATA.forEach(item => store.add(item));
         console.log("Database seeded with sample content");
       }
     };
     
     transaction.oncomplete = () => resolve();
     transaction.onerror = () => resolve(); 
  });
};

export const saveMediaItemToDB = async (item: MediaItem) => {
  const db = await initDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction([STORE_MEDIA], 'readwrite');
    const store = transaction.objectStore(STORE_MEDIA);
    
    const getRequest = store.get(item.id);
    
    getRequest.onsuccess = () => {
        const existing = getRequest.result;
        const dataToSave = { ...item };
        
        if (!dataToSave.blob && existing && existing.blob) {
            dataToSave.blob = existing.blob;
        }
        
        const { url, ...dbRecord } = dataToSave;
        if (url && !url.startsWith('http')) {
             // It's a blob url, don't save it
        } else {
            (dbRecord as any).url = url;
        }
        
        store.put(dbRecord);
    };

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

export const getMediaItemsFromDB = async (): Promise<MediaItem[]> => {
  const db = await initDB();
  await seedDatabase(db); 

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_MEDIA], 'readonly');
    const store = transaction.objectStore(STORE_MEDIA);
    const request = store.getAll();

    request.onsuccess = () => {
      const items = request.result;
      const hydratedItems = items.map((item: any) => ({
        ...item,
        url: item.blob ? URL.createObjectURL(item.blob) : (item.url || '')
      }));
      resolve(hydratedItems);
    };
    request.onerror = () => reject(request.error);
  });
};

export const deleteMediaItemFromDB = async (id: string) => {
  const db = await initDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction([STORE_MEDIA], 'readwrite');
    const store = transaction.objectStore(STORE_MEDIA);
    store.delete(id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

export const deleteUserMediaFromDB = async (userId: string) => {
  const db = await initDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction([STORE_MEDIA], 'readwrite');
    const store = transaction.objectStore(STORE_MEDIA);
    const cursorRequest = store.openCursor();

    cursorRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
            const item = cursor.value as MediaItem;
            if (item.userId === userId) {
                cursor.delete();
            }
            cursor.continue();
        }
    };

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

export const saveConfigToDB = async (config: HeaderConfig) => {
    const db = await initDB();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([STORE_CONFIG], 'readwrite');
      const store = transaction.objectStore(STORE_CONFIG);
      store.put({ key: 'header_config', ...config });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
};

export const getConfigFromDB = async (): Promise<HeaderConfig | null> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_CONFIG], 'readonly');
      const store = transaction.objectStore(STORE_CONFIG);
      const request = store.get('header_config');
  
      request.onsuccess = () => {
        if (request.result) {
            const { key, ...config } = request.result;
            resolve(config as HeaderConfig);
        } else {
            resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  };

// Generic save/upsert user function to handle Google Login and recovery
export const saveUserToDB = async (user: User): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_USERS], 'readwrite');
        const store = transaction.objectStore(STORE_USERS);
        store.put(user);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};

export const registerUser = async (email: string, password: string, name: string): Promise<User> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_USERS], 'readwrite');
        const store = transaction.objectStore(STORE_USERS);
        
        const checkRequest = store.get(email);
        
        checkRequest.onsuccess = () => {
            if (checkRequest.result) {
                reject(new Error("User already exists"));
                return;
            }
            
            const newUser = {
                email,
                password, 
                name,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(' ', '')}`
            };
            
            const addRequest = store.add(newUser);
            addRequest.onsuccess = () => {
                const { password, ...safeUser } = newUser;
                resolve(safeUser);
            };
            addRequest.onerror = () => reject(new Error("Failed to register user"));
        };
        checkRequest.onerror = () => reject(checkRequest.error);
    });
};

export const authenticateUser = async (email: string, password: string): Promise<User> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_USERS], 'readonly');
        const store = transaction.objectStore(STORE_USERS);
        
        const request = store.get(email);
        
        request.onsuccess = () => {
            const user = request.result;
            if (user && user.password === password) {
                const { password, ...safeUser } = user;
                resolve(safeUser);
            } else {
                reject(new Error("Invalid email or password"));
            }
        };
        request.onerror = () => reject(request.error);
    });
};

export const updateUser = async (email: string, updates: Partial<User>): Promise<User> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_USERS], 'readwrite');
        const store = transaction.objectStore(STORE_USERS);
        
        const request = store.get(email);
        
        request.onsuccess = () => {
            const user = request.result;
            if (!user) {
                reject(new Error("User not found"));
                return;
            }
            
            const updatedUser = { ...user, ...updates };
            const putRequest = store.put(updatedUser);
            
            putRequest.onsuccess = () => {
                const { password, ...safeUser } = updatedUser;
                resolve(safeUser);
            };
            putRequest.onerror = () => reject(putRequest.error);
        };
        request.onerror = () => reject(request.error);
    });
};

export const changePassword = async (email: string, oldPass: string, newPass: string): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_USERS], 'readwrite');
        const store = transaction.objectStore(STORE_USERS);
        
        const request = store.get(email);
        
        request.onsuccess = () => {
            const user = request.result;
            if (!user) {
                reject(new Error("User not found"));
                return;
            }
            
            if (user.password !== oldPass) {
                reject(new Error("Incorrect old password"));
                return;
            }
            
            user.password = newPass;
            store.put(user);
            resolve();
        };
        request.onerror = () => reject(request.error);
    });
};
