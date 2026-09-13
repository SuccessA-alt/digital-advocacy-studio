package com.advocacy.backend.sdg;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity // Tells JPA that this Java class represents a database table
@Table(name = "sdgs") // The table in PostgreSQL will be called "sdgs"
public class Sdg {

    @Id // Primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    // MySQL will generate the id automatically
    private Long id;

    @Column(name = "goal_number", nullable = false, unique = true)
    // Maps this field to the goal_number column
    private Integer goalNumber;

    @Column(nullable = false, length = 100)
    private String name;

    // JPA needs an empty constructor
    public Sdg() {
    }

    // Useful when we want to create an SDG ourselves
    public Sdg(Integer goalNumber, String name) {
        this.goalNumber = goalNumber;
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public Integer getGoalNumber() {
        return goalNumber;
    }

    public void setGoalNumber(Integer goalNumber) {
        this.goalNumber = goalNumber;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}