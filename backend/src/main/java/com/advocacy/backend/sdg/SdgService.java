package com.advocacy.backend.sdg;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SdgService {

    private final SdgRepository sdgRepository;

    public SdgService(SdgRepository sdgRepository) {
        this.sdgRepository = sdgRepository;
    }

    public List<Sdg> getAllSdgs() {
        return sdgRepository.findAll();
    }

    public Optional<Sdg> getSdgById(Long id) {
        return sdgRepository.findById(id);
    }
}