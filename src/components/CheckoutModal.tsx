import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  tipo: 'suscripcion' | 'curso';
  itemId: string;
  precio: number;
  titulo: string;
}

export function CheckoutModal({ open, onClose, tipo, itemId, precio, titulo }: CheckoutModalProps) {
  const [loading, setLoading] = useState(false);
  const [metodo, setMetodo] = useState<'mercadopago' | 'paypal'>('mercadopago');
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePagarMercadoPago = async () => {
    if (!user) { navigate('/login'); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-mercadopago-subscription', {
        body: { mentor_id: itemId, user_id: user.id },
      });
      if (error) throw error;
      window.location.href = data.init_point;
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
      setLoading(false);
    }
  };

  const handlePagarPayPal = async () => {
    if (!user) { navigate('/login'); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-paypal-order', {
        body: { tipo, item_id: itemId, user_id: user.id },
      });
      if (error) throw error;
      window.location.href = data.approval_url;
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Completar pago</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">{titulo}</p>
            <p className="text-2xl font-bold gradient-text">${precio.toLocaleString('es-AR')}</p>
          </div>

          <Tabs value={metodo} onValueChange={(v) => setMetodo(v as typeof metodo)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="mercadopago">MercadoPago</TabsTrigger>
              <TabsTrigger value="paypal">PayPal</TabsTrigger>
            </TabsList>

            <TabsContent value="mercadopago" className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">
                Tarjetas de crédito/débito, Rapipago, PagoFácil y más
              </p>
              <Button
                onClick={handlePagarMercadoPago}
                disabled={loading}
                className="w-full gradient-sumak text-white border-0"
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Procesando...</>
                ) : (
                  'Pagar con MercadoPago'
                )}
              </Button>
            </TabsContent>

            <TabsContent value="paypal" className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">
                Pagá de forma segura con tu cuenta de PayPal
              </p>
              <Button
                onClick={handlePagarPayPal}
                disabled={loading}
                className="w-full"
                variant="outline"
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Procesando...</>
                ) : (
                  'Pagar con PayPal'
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
