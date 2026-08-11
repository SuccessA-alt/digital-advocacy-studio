package com.advocacy.backend.sdg;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SdgDataLoader implements CommandLineRunner {

    private final SdgRepository sdgRepository;

    public SdgDataLoader(SdgRepository sdgRepository) {
        this.sdgRepository = sdgRepository;
    }

    @Override
    public void run(String... args) {

        // Only add the SDGs if the table is empty.
        // This prevents duplicates every time the app starts.
        if (sdgRepository.count() == 0) {

            List<Sdg> sdgs = List.of(
                new Sdg(1, "No Poverty"),
                new Sdg(2, "Zero Hunger"),
                new Sdg(3, "Good Health and Well-being"),
                new Sdg(4, "Quality Education"),
                new Sdg(5, "Gender Equality"),
                new Sdg(6, "Clean Water and Sanitation"),
                new Sdg(7, "Affordable and Clean Energy"),
                new Sdg(8, "Decent Work and Economic Growth"),
                new Sdg(9, "Industry, Innovation and Infrastructure"),
                new Sdg(10, "Reduced Inequalities"),
                new Sdg(11, "Sustainable Cities and Communities"),
                new Sdg(12, "Responsible Consumption and Production"),
                new Sdg(13, "Climate Action"),
                new Sdg(14, "Life Below Water"),
                new Sdg(15, "Life on Land"),
                new Sdg(16, "Peace, Justice and Strong Institutions"),
                new Sdg(17, "Partnerships for the Goals")
            );

            sdgRepository.saveAll(sdgs);
        }
    }
}