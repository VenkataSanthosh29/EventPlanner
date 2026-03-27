// package com.edutech.entities;

// import javax.persistence.Entity;
// import javax.persistence.Table;


// public class Client{
//     // Additional fields specific to Client if any
// }
package com.edutech.entities;

import javax.persistence.*;

@Entity
@Table(name = "clients")
public class Client extends User {
}