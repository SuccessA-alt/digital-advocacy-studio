package com.advocacy.backend.campaign;

import com.advocacy.backend.sdg.Sdg;
import org.openpdf.text.Document;
import org.openpdf.text.DocumentException;
import org.openpdf.text.Font;
import org.openpdf.text.Paragraph;
import org.openpdf.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
public class CampaignPdfService {

    public byte[] createCampaignPdf(Campaign campaign) {
        return createPdf(campaign, null);
    }

    public byte[] createCampaignVersionPdf(CampaignVersion version) {
        // A temporary copy used only to render this version's PDF.
        Campaign snapshot = new Campaign();

        snapshot.setTitle(version.getTitle());
        snapshot.setProblem(version.getProblem());
        snapshot.setDesiredOutcome(version.getDesiredOutcome());
        snapshot.setCoreMessage(version.getCoreMessage());
        snapshot.setSharingMethod(version.getSharingMethod());
        snapshot.setDecisionMaker(version.getDecisionMaker());
        snapshot.setAdvocacyPlan(version.getAdvocacyPlan());
        snapshot.setSuccessMeasures(version.getSuccessMeasures());

        if (version.getSdgId() != null) {
            snapshot.setSdg(new Sdg(
                    version.getSdgGoalNumber(),
                    version.getSdgName()
            ));
        }

        return createPdf(snapshot, version.getVersionNumber());
    }

    private byte[] createPdf(
            Campaign campaign,
            Integer versionNumber) {

        ByteArrayOutputStream outputStream =
                new ByteArrayOutputStream();

        Document document = new Document();

        try {
            PdfWriter.getInstance(document, outputStream);
            document.open();

            document.add(new Paragraph(
                    campaign.getTitle(),
                    new Font(Font.HELVETICA, 20, Font.BOLD)
            ));

            if (versionNumber != null) {
                document.add(new Paragraph(
                        "Version " + versionNumber
                ));
            }

            addSection(
                    document,
                    "The problem",
                    campaign.getProblem()
            );

            if (campaign.getSdg() != null) {
                addSection(
                        document,
                        "Sustainable Development Goal",
                        "Goal " + campaign.getSdg().getGoalNumber()
                                + ": " + campaign.getSdg().getName()
                );
            }

            addSection(
                    document,
                    "Desired change",
                    campaign.getDesiredOutcome()
            );

            addSection(
                    document,
                    "Core message",
                    campaign.getCoreMessage()
            );

            addSection(
                    document,
                    "Who can make the change",
                    campaign.getDecisionMaker()
            );

            addSection(
                    document,
                    "Advocacy plan",
                    campaign.getAdvocacyPlan()
            );

            addSection(
                    document,
                    "How success will be measured",
                    campaign.getSuccessMeasures()
            );
        } catch (DocumentException exception) {
            throw new IllegalStateException(
                    "Could not generate the campaign PDF",
                    exception
            );
        } finally {
            document.close();
        }

        return outputStream.toByteArray();
    }

    private void addSection(
            Document document,
            String heading,
            String content) throws DocumentException {

        Paragraph label = new Paragraph(
                heading,
                new Font(Font.HELVETICA, 12, Font.BOLD)
        );

        label.setSpacingBefore(16);
        label.setSpacingAfter(6);
        label.setKeepTogether(true);

        document.add(label);
        document.add(new Paragraph(content == null ? "" : content));
    }
}