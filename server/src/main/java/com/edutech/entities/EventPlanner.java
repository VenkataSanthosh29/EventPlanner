// package com.edutech.entities;


// import javax.persistence.Entity;
// import javax.persistence.Table;


// public class EventPlanner 
// {


//     // write the code here
// }

package com.edutech.entities;

import javax.persistence.*;

@Entity
@Table(name = "event_planners")
public class EventPlanner extends User {
}
