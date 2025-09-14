# Structure Firestore pour Sama-Quete

## Collection: users
```javascript
users/{userId} {
  uid: string,           // ID Firebase Auth
  email: string,
  displayName: string,
  role: 'super_admin' | 'diocese_admin' | 'parish_admin' | 'user',
  dioceseId?: string,    // Pour diocese_admin et parish_admin
  parishId?: string,     // Pour parish_admin
  permissions: {
    canManageUsers: boolean,
    canManageDioceses: boolean,
    canManageParishes: boolean,
    canManageContent: boolean,
    canViewReports: boolean,
    canManageDonations: boolean
  },
  isActive: boolean,
  createdAt: timestamp,
  updatedAt: timestamp,
  lastLoginAt: timestamp
}
```

## Collection: dioceses
```javascript
dioceses/{dioceseId} {
  name: string,
  location: string,
  bishop: string,
  contactInfo: {
    email: string,
    phone: string,
    address: string
  },
  isActive: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Collection: parishes
```javascript
parishes/{parishId} {
  name: string,
  dioceseId: string,
  location: string,
  priest: string,
  contactInfo: {
    email: string,
    phone: string,
    address: string
  },
  isActive: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```