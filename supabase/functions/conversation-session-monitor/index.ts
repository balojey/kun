import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { ElevenLabsClient } from 'npm:@elevenlabs/elevenlabs-js@2.0.1';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const elevenLabsClient = new ElevenLabsClient({ 
  apiKey: Deno.env.get('ELEVENLABS_API_KEY')! 
});

// This function should NOT be exposed to frontend - it's for internal monitoring only
Deno.serve(async (req) => {
  // Only allow internal calls - no CORS headers
  if (req.method === 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    console.log('Starting conversation session monitoring...');

    // Query all active conversation sessions
    const { data: activeSessions, error: fetchError } = await supabase
      .from('conversation_sessions')
      .select('*')
      // .in('status', ['initiated', 'in-progress', 'processing']);

    if (fetchError) {
      console.error('Error fetching active sessions:', fetchError);
      return new Response(JSON.stringify({ error: 'Failed to fetch sessions' }), { 
        status: 500 
      });
    }

    if (!activeSessions || activeSessions.length === 0) {
      console.log('No active conversation sessions found');
      return new Response(JSON.stringify({ 
        message: 'No active sessions to monitor',
        processed: 0 
      }));
    }

    console.log(`Found ${activeSessions.length} active conversation sessions`);

    let processedCount = 0;
    let completedCount = 0;

    // Process each active session
    for (const session of activeSessions) {
      try {
        console.log(`Processing conversation ${session.conversation_id} for user ${session.user_id}`);

        // Fetch conversation details from ElevenLabs
        const conversationDetails = await elevenLabsClient.conversationalAi.conversations.get(
          session.conversation_id
        );
        // return new Response(JSON.stringify({conversationDetails}))

        console.log(`Conversation ${session.conversation_id} status: ${conversationDetails.status} - Duration: ${conversationDetails.metadata?.callDurationSecs} seconds`);

        // Update session with latest status and duration
        const updateData: any = {
          status: conversationDetails.status,
          conversation_duration: conversationDetails.metadata?.callDurationSecs || 0
        };
        console.log('Updating session with data:', updateData);

        const { error: updateError } = await supabase
          .from('conversation_sessions')
          .update(updateData)
          .eq('id', session.id);

        if (updateError) {
          console.error(`Error updating session ${session.id}:`, updateError);
          continue;
        }

        processedCount++;

        // If conversation is done or failed, archive it and deduct tokens
        if (conversationDetails.status === 'done' || conversationDetails.status === 'failed') {
          console.log(`Conversation ${session.conversation_id} completed with status: ${conversationDetails.status}`);

          const duration = conversationDetails.metadata?.callDurationSecs || 0;
          console.log(`Conversation ${session.conversation_id} duration: ${duration} seconds`);

          // Deduct tokens for conversation duration (1 token per second)
          if (duration > 0) {
            const { error: deductError } = await supabase.rpc('deduct_tokens_for_conversation', {
              user_id_param: session.user_id,
              conversation_duration_param: duration,
              conversation_id_param: session.conversation_id
            });

            if (deductError) {
              console.error(`Error deducting tokens for conversation ${session.conversation_id}:`, deductError);
            } else {
              console.log(`Deducted ${Math.ceil(duration)} tokens for conversation ${session.conversation_id}`);
            }
          }

          // Archive to conversation_history
          const { error: archiveError } = await supabase
            .from('conversation_history')
            .insert({
              user_id: session.user_id,
              conversation_id: session.conversation_id,
              status: conversationDetails.status,
              conversation_duration: duration,
              created_at: session.created_at,
              completed_at: new Date().toISOString()
            });

          if (archiveError) {
            console.error(`Error archiving conversation ${session.conversation_id}:`, archiveError);
            continue;
          }

          // Delete from active sessions
          const { error: deleteError } = await supabase
            .from('conversation_sessions')
            .delete()
            .eq('id', session.id);

          if (deleteError) {
            console.error(`Error deleting session ${session.id}:`, deleteError);
          } else {
            console.log(`Successfully archived and cleaned up conversation ${session.conversation_id}`);
            completedCount++;
          }
        }

      } catch (conversationError) {
        console.error(`Error processing conversation ${session.conversation_id}:`, conversationError);
        
        // Mark conversation as failed if we can't fetch it
        if (conversationError instanceof Error && conversationError.message.includes('not found')) {
          const { error: failError } = await supabase
            .from('conversation_sessions')
            .update({ status: 'failed' })
            .eq('id', session.id);

          if (failError) {
            console.error(`Error marking conversation as failed:`, failError);
          }
        }
        continue;
      }
    }

    console.log(`Monitoring complete. Processed: ${processedCount}, Completed: ${completedCount}`);

    return new Response(JSON.stringify({ 
      message: 'Monitoring complete',
      processed: processedCount,
      completed: completedCount,
      total_sessions: activeSessions.length
    }));

  } catch (error) {
    console.error('Conversation monitoring error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal monitoring error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500 
    });
  }
});