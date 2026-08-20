package com.advocacy.backend.campaign;

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

        ByteArrayOutputStream outputStream =
                new ByteArrayOutputStream();

        Document document = new Document();

        try {
            PdfWriter.getInstance(
                    document,
                    outputStream
            );

            document.open();

            Font titleFont =
                    new Font(
                            Font.HELVETICA,
                            20,
                            Font.BOLD
                    );

            document.add(
                    new Paragraph(
                            campaign.getTitle(),
                            titleFont
                    )
            );

            addSection(
                    document,
                    "The problem",
                    campaign.getProblem()
            );

            String sdgText;

            if (campaign.getSdg() == null) {
                sdgText = "No SDG selected";
            } else {
                sdgText =
                        "Goal "
                        + campaign.getSdg().getGoalNumber()
                        + ": "
                        + campaign.getSdg().getName();
            }

            addSection(
                    document,
                    "Sustainable Development Goal",
                    sdgText
            );

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
                    "How the message will be shared",
                    campaign.getSharingMethod()
            );

            addSection(
                    document,
                    "Who can make the change",
                    campaign.getDecisionMaker()
            );

            addSection(
                    document,
                    "First move",
                    campaign.getFirstMoves()
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
            String content)
            throws DocumentException {

        Font headingFont =
                new Font(
                        Font.HELVETICA,
                        12,
                        Font.BOLD
                );

        document.add(
                new Paragraph(
                        "\n" + heading,
                        headingFont
                )
        );

        document.add(
                new Paragraph(content)
        );
    }
}