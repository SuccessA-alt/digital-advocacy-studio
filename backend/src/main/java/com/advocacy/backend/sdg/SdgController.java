package com.advocacy.backend.sdg;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/sdgs")
public class SdgController {

    private final SdgService sdgService;

    public SdgController(SdgService sdgService) {
        this.sdgService = sdgService;
    }

    @GetMapping
    public List<Sdg> getAllSdgs() {
        return sdgService.getAllSdgs();
    }
}