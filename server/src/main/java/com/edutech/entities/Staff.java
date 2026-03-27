// package com.edutech.entities;

// import javax.persistence.Entity;
// import javax.persistence.Table;


// public class Staff {
    
    
//     // Additional fields specific to Staff if any
// }
package com.edutech.entities;

import javax.persistence.*;

@Entity
@Table(name = "staff")
public class Staff extends User {
}